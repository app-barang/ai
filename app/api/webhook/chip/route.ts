import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { getChipPurchase, getPaymentRef, hasChip } from "@/lib/chip";
import { addFund } from "@/lib/pool";
import { round4 } from "@/lib/bonus";
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
    console.log("[CHIP webhook]", { purchaseId, status: purchase.status, hasRef: !!ref });
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

    const isPaid = purchase.status === "paid";

    if (ref.type === "subscription") {
      const merchantId = String(ref.merchantId);
      const tier = ref.tier as MerchantTier | undefined;

      if (isPaid) {
        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 864e5);

        // Cari subscription PENDING terbaru untuk merchant+tier
        const pending = await withDbRetry(() =>
          prisma.merchantSubscription.findFirst({
            where: { merchantId, status: "PENDING" },
            orderBy: { createdAt: "desc" },
          })
        );

        const sub = pending
          ? await withDbRetry(() =>
              prisma.merchantSubscription.update({
                where: { id: pending.id },
                data: { status: "PAID", paidAt: now, periodStart: now, periodEnd },
              })
            )
          : await withDbRetry(() =>
              prisma.merchantSubscription.create({
                data: {
                  merchantId,
                  tier: tier ?? "STARTER",
                  amount: Number(purchase.purchase?.total ?? 0) / 100,
                  status: "PAID",
                  platformShare: 0,
                  rentPoolShare: 0,
                  floatingShare: 0,
                  periodStart: now,
                  periodEnd,
                  paidAt: now,
                  invoiceUrl: null,
                },
              })
            );

        await withDbRetry(() =>
          prisma.merchant.update({
            where: { id: merchantId },
            data: {
              status: "ACTIVE",
              subscribedAt: now,
              expiresAt: periodEnd,
              ...(tier ? { tier } : {}),
            },
          })
        );

        // Agih dana ke pool (guna split dari subscription)
        if (sub.rentPoolShare > 0) await addFund("RENT_POOL", sub.rentPoolShare);
        if (sub.floatingShare > 0) await addFund("CLICK_POOL", sub.floatingShare);

        return NextResponse.json({ status: "OK", handled: "subscription_paid", subscriptionId: sub.id });
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

      const order = await withDbRetry(() => prisma.order.findUnique({ where: { id: orderId } }));
      if (!order || order.status !== "PENDING") {
        return NextResponse.json({ status: "OK", handled: "already_processed" });
      }

      // Margin platform 10% dari jumlah; afiliator dapat 30% daripada margin (jika ada)
      const platformFee = round4(order.totalAmount * 0.1);
      const affiliateCommission = order.affiliateId ? round4(platformFee * 0.3) : 0;
      const merchantNet = round4(order.totalAmount - platformFee);

      await withDbRetry(() =>
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paidAt: new Date(),
            paymentMethod: "chip",
            paymentRef: purchaseId,
            platformFee,
            merchantNet,
            affiliateCommission,
          },
        })
      );

      await withDbRetry(() =>
        prisma.merchant.update({
          where: { id: order.merchantId },
          data: {
            totalSales: { increment: order.quantity },
            totalRevenue: { increment: order.totalAmount },
          },
        })
      );
      await withDbRetry(() =>
        prisma.product.update({
          where: { id: order.productId },
          data: { sold: { increment: order.quantity } },
        })
      );

      if (order.affiliateId) {
        await withDbRetry(() =>
          prisma.earning.create({
            data: {
              affiliateId: order.affiliateId as string,
              type: "SALE_COMMISSION",
              level: 1,
              sourceType: "SALE",
              sourceId: orderId,
              grossAmount: platformFee,
              percentage: 0.3,
              netAmount: affiliateCommission,
              description: `Komisen jualan ${order.orderNumber}`,
              status: "PENDING",
            },
          })
        );
        await withDbRetry(() =>
          prisma.affiliate.update({
            where: { id: order.affiliateId as string },
            data: {
              balance: { increment: affiliateCommission },
              pendingBalance: { increment: affiliateCommission },
              totalEarnings: { increment: affiliateCommission },
            },
          })
        );
      }

      return NextResponse.json({
        status: "OK",
        handled: "order_paid",
        orderId,
        affiliateCommission,
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
