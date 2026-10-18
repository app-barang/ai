import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { getChipPurchase, getPaymentRef, hasChip, savePaymentRef } from "@/lib/chip";
import { monthPeriod, saleCommissionSplit, splitSubscription } from "@/lib/bonus";
import { distributeRentRewards } from "@/lib/rent";
import type { MerchantTier } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook CHIP.
 * Keselamatan: TIDAK percaya body mentah — sahkan dengan
 * memanggil API CHIP (GET /purchases/{id}) guna secret key kita.
 * Jika ada CHIP_WEBHOOK_SECRET, semak juga HMAC X-Signature.
 */
export async function POST(req: NextRequest) {
  try {
    if (!hasChip()) {
      return NextResponse.json({ error: "Gateway tidak dikonfigurasi" }, { status: 503 });
    }

    const raw = await req.text();
    const body = JSON.parse(raw || "{}");

    // --- Pengesahan pilihan: HMAC X-Signature (jika secret diset) ---
    const webhookSecret = process.env.CHIP_WEBHOOK_SECRET;
    if (webhookSecret) {
      const sig = req.headers.get("x-signature") ?? "";
      const { createHmac, timingSafeEqual } = await import("crypto");
      const expected = createHmac("sha256", webhookSecret).update(raw).digest("hex");
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return NextResponse.json({ error: "Tandatangan tidak sah" }, { status: 401 });
      }
    }

    const purchaseId: string | undefined = body.id ?? body.purchase_id;
    if (!purchaseId) {
      return NextResponse.json({ error: "id pembelian diperlukan" }, { status: 400 });
    }

    // --- Sumber kebenaran: CHIP API ---
    const purchase = await getChipPurchase(purchaseId);
    const ref = await getPaymentRef(purchaseId);

    // Log berterusan (boleh disemak walaupun log Vercel luput)
    await prisma.aICache
      .upsert({
        where: { key: `whlog:${purchaseId}` },
        update: {
          value: {
            chipStatus: purchase.status,
            handled: ref?.type ?? "no_ref",
            receivedAt: new Date().toISOString(),
          } as never,
          expiresAt: new Date(Date.now() + 30 * 864e5),
        },
        create: {
          key: `whlog:${purchaseId}`,
          value: {
            chipStatus: purchase.status,
            handled: ref?.type ?? "no_ref",
            receivedAt: new Date().toISOString(),
          } as never,
          expiresAt: new Date(Date.now() + 30 * 864e5),
        },
      })
      .catch(() => {});

    if (!ref) {
      return NextResponse.json({ status: "OK", note: "ref tidak dijumpai (diabaikan)" });
    }

    // Idempotency: callback berulang selepas diproses — jangan ulang kesan sampingan
    if (ref.processed === true) {
      return NextResponse.json({ status: "OK", handled: "already_processed" });
    }

    const isPaid = purchase.status === "paid";

    if (ref.type === "subscription") {
      const merchantId = String(ref.merchantId);
      const tier = ref.tier as MerchantTier | undefined;

      if (isPaid) {
        const now = new Date();
        const period = monthPeriod(now);
        const periodEnd = new Date(now.getTime() + 30 * 864e5);
        const refSubId = ref.subscriptionId ? String(ref.subscriptionId) : null;

        // Semua kemas kini kewangan dalam SATU transaksi:
        // langganan → split → pool → Bonus Sewa → baki afiliator.
        const outcome = await withDbRetry(() =>
          prisma.$transaction(
            async (tx) => {
              let sub = refSubId
                ? await tx.merchantSubscription.findUnique({ where: { id: refSubId } })
                : await tx.merchantSubscription.findFirst({
                    where: { merchantId, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                  });

              // Idempotency: langganan sudah diaktifkan
              if (sub?.status === "PAID") {
                return {
                  already: true as const,
                  sub,
                  rewards: { total: 0, levels: [] },
                };
              }

              const effectiveTier = (sub?.tier ?? tier ?? "STARTER") as MerchantTier;
              const split = splitSubscription(effectiveTier);

              const subData = {
                tier: effectiveTier,
                amount: split.amount,
                status: "PAID" as const,
                platformShare: split.platformShare,
                rentPoolShare: split.rentPoolShare,
                floatingShare: split.floatingShare,
                periodStart: now,
                periodEnd,
                paidAt: now,
              };

              if (sub) {
                sub = await tx.merchantSubscription.update({
                  where: { id: sub.id },
                  data: subData,
                });
              } else {
                sub = await tx.merchantSubscription.create({
                  data: { merchantId, ...subData },
                });
              }

              await tx.merchant.update({
                where: { id: merchantId },
                data: {
                  status: "ACTIVE",
                  subscribedAt: now,
                  expiresAt: periodEnd,
                  tier: effectiveTier,
                },
              });

              // --- Split 3-arah: platform / rent pool / floating fund ---
              if (split.rentPoolShare > 0) {
                await tx.rewardPool.upsert({
                  where: { type_period: { type: "RENT_POOL", period } },
                  update: {
                    totalFund: { increment: split.rentPoolShare },
                    remaining: { increment: split.rentPoolShare },
                  },
                  create: {
                    type: "RENT_POOL",
                    period,
                    totalFund: split.rentPoolShare,
                    remaining: split.rentPoolShare,
                  },
                });
              }

              if (split.floatingShare > 0) {
                await tx.rewardPool.upsert({
                  where: { type_period: { type: "CLICK_POOL", period } },
                  update: {
                    totalFund: { increment: split.floatingShare },
                    remaining: { increment: split.floatingShare },
                  },
                  create: {
                    type: "CLICK_POOL",
                    period,
                    totalFund: split.floatingShare,
                    remaining: split.floatingShare,
                  },
                });
              }

              // --- Bonus Sewa: HANYA dari rentPoolShare (RM9, bukan RM30) ---
              const rewards = await distributeRentRewards(tx, {
                merchantId,
                subscriptionId: sub.id,
                rentPoolAmount: split.rentPoolShare,
              });

              if (rewards.total > 0) {
                await tx.rewardPool.update({
                  where: { type_period: { type: "RENT_POOL", period } },
                  data: {
                    allocated: { increment: rewards.total },
                    remaining: { decrement: rewards.total },
                  },
                });
              }

              return { already: false as const, sub, rewards };
            },
            { timeout: 30_000, maxWait: 10_000 }
          )
        );

        await savePaymentRef(purchaseId, { ...ref, processed: true });

        if (outcome.already) {
          return NextResponse.json({ status: "OK", handled: "already_processed" });
        }

        return NextResponse.json({
          status: "OK",
          handled: "subscription_paid",
          subscriptionId: outcome.sub.id,
          platformShare: outcome.sub.platformShare,
          rentPoolShare: outcome.sub.rentPoolShare,
          floatingShare: outcome.sub.floatingShare,
          rentDistributed: outcome.rewards.total,
          levels: outcome.rewards.levels.length,
        });
      }

      if (["expired", "cancelled", "error", "blocked"].includes(purchase.status)) {
        await withDbRetry(() =>
          prisma.merchantSubscription.updateMany({
            where: { merchantId, status: "PENDING" },
            data: { status: "EXPIRED" },
          })
        );
        return NextResponse.json({ status: "OK", handled: "subscription_failed", chipStatus: purchase.status });
      }

      return NextResponse.json({ status: "OK", handled: "noop", chipStatus: purchase.status });
    }

    if (ref.type === "order") {
      const orderId = String(ref.orderId);

      if (!isPaid) {
        if (["expired", "cancelled", "error", "blocked"].includes(purchase.status)) {
          await withDbRetry(() =>
            prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } })
          );
        }
        return NextResponse.json({ status: "OK", handled: "noop", chipStatus: purchase.status });
      }

      const outcome = await withDbRetry(() =>
        prisma.$transaction(
          async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order || order.status !== "PENDING") {
              return { already: true as const };
            }

            // Guna split yang disimpan semasa order dicipta.
            // Fallback untuk order lama yang belum mempunyai split.
            const hasStoredSplit = order.platformFee > 0 || order.merchantNet > 0;
            const split = hasStoredSplit
              ? {
                  platformFee: order.platformFee,
                  merchantNet: order.merchantNet,
                  affiliateCommission: order.affiliateId
                    ? order.affiliateCommission
                    : 0,
                }
              : saleCommissionSplit(order.totalAmount, !!order.affiliateId);

            const paidAt = new Date();

            await tx.order.update({
              where: { id: orderId },
              data: {
                status: "PAID",
                paidAt,
                paymentMethod: "chip",
                paymentRef: purchaseId,
                platformFee: split.platformFee,
                merchantNet: split.merchantNet,
                affiliateCommission: split.affiliateCommission,
              },
            });

            await tx.merchant.update({
              where: { id: order.merchantId },
              data: {
                totalSales: { increment: order.quantity },
                totalRevenue: { increment: order.totalAmount },
              },
            });

            await tx.product.update({
              where: { id: order.productId },
              data: { sold: { increment: order.quantity } },
            });

            // Tutup gelung klik afiliator → order → pembayaran
            if (order.clickId) {
              await tx.click.updateMany({
                where: { id: order.clickId },
                data: { converted: true, convertedAt: paidAt, orderId },
              });
            }

            if (order.affiliateId && split.affiliateCommission > 0) {
              await tx.earning.create({
                data: {
                  affiliateId: order.affiliateId,
                  type: "SALE_COMMISSION",
                  level: 1,
                  sourceType: "SALE",
                  sourceId: orderId,
                  grossAmount: split.platformFee,
                  percentage: 0.3,
                  netAmount: split.affiliateCommission,
                  description: `Komisen jualan ${order.orderNumber}`,
                  status: "PENDING",
                },
              });

              await tx.affiliate.update({
                where: { id: order.affiliateId },
                data: {
                  balance: { increment: split.affiliateCommission },
                  pendingBalance: { increment: split.affiliateCommission },
                  totalEarnings: { increment: split.affiliateCommission },
                  totalSales: { increment: order.quantity },
                },
              });
            }

            return { already: false as const, split };
          },
          { timeout: 30_000, maxWait: 10_000 }
        )
      );

      await savePaymentRef(purchaseId, { ...ref, processed: true });

      if (outcome.already) {
        return NextResponse.json({ status: "OK", handled: "already_processed" });
      }

      return NextResponse.json({
        status: "OK",
        handled: "order_paid",
        orderId,
        platformFee: outcome.split.platformFee,
        merchantNet: outcome.split.merchantNet,
        affiliateCommission: outcome.split.affiliateCommission,
      });
    }

    return NextResponse.json({ status: "OK", handled: "unknown_ref" });
  } catch (error) {
    console.error("[API /api/webhook/chip]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Ralat webhook" },
      { status: 500 }
    );
  }
}
