import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";
import { splitSubscription, SUBSCRIPTION_SPLIT } from "@/lib/bonus";
import { addFund } from "@/lib/pool";
import type { MerchantTier } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS: MerchantTier[] = ["STARTER", "PRO", "BUSINESS"];

export async function POST(req: NextRequest) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const body = await req.json().catch(() => ({}));
    const tier = String(body.tier ?? "STARTER") as MerchantTier;
    // Untuk ujian: simulatePaid (true = anggap pembayaran berjaya; sebenar via webhook ToyyibPay)
    const simulatePaid = body.simulatePaid !== false;

    if (!TIERS.includes(tier)) {
      return NextResponse.json({ error: "Tier tidak sah" }, { status: 400 });
    }

    const split = splitSubscription(tier);
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 864e5);

    const subscription = await withDbRetry(() =>
      prisma.merchantSubscription.create({
        data: {
          merchantId,
          tier,
          amount: split.amount,
          status: simulatePaid ? "PAID" : "PENDING",
          platformShare: split.platformShare,
          rentPoolShare: split.rentPoolShare,
          floatingShare: split.floatingShare,
          periodStart: now,
          periodEnd,
          paidAt: simulatePaid ? now : null,
        },
      })
    );

    if (simulatePaid) {
      await withDbRetry(() =>
        prisma.merchant.update({
          where: { id: merchantId },
          data: { tier, status: "ACTIVE", subscribedAt: now, expiresAt: periodEnd },
        })
      );

      // Agih ke pool sebenar: sewa → RENT_POOL, floating → CLICK_POOL
      await Promise.all([
        addFund("RENT_POOL", split.rentPoolShare),
        addFund("CLICK_POOL", split.floatingShare),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          amount: subscription.amount,
          status: subscription.status,
          periodStart: subscription.periodStart,
          periodEnd: subscription.periodEnd,
        },
        split: {
          platform: split.platformShare,
          rentPool: split.rentPoolShare,
          floating: split.floatingShare,
        },
        config: SUBSCRIPTION_SPLIT[tier],
        payment: simulatePaid
          ? { provider: "toyyibpay", status: "SIMULATED_PAID" }
          : { provider: "toyyibpay", status: "AWAITING_PAYMENT", note: "Integrasi penuh di Group 4" },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/merchant/subscribe]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
