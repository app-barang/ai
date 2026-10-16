import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";
import { PRODUCT_LIMITS, SUBSCRIPTION_SPLIT } from "@/lib/bonus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const [merchant, subscriptions] = await Promise.all([
      withDbRetry(() =>
        prisma.merchant.findUnique({
          where: { id: merchantId },
          select: {
            businessName: true,
            tier: true,
            status: true,
            subscribedAt: true,
            expiresAt: true,
          },
        })
      ),
      withDbRetry(() =>
        prisma.merchantSubscription.findMany({
          where: { merchantId },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      ),
    ]);

    const active = subscriptions.find((s) => s.status === "PAID") ?? null;
    const limit = merchant ? PRODUCT_LIMITS[merchant.tier] : 0;

    const daysLeft = merchant?.expiresAt
      ? Math.max(0, Math.ceil((merchant.expiresAt.getTime() - Date.now()) / 864e5))
      : 0;

    return NextResponse.json({
      current: active
        ? {
            id: active.id,
            tier: active.tier,
            amount: active.amount,
            status: active.status,
            periodStart: active.periodStart,
            periodEnd: active.periodEnd,
            split: {
              platform: active.platformShare,
              rentPool: active.rentPoolShare,
              floating: active.floatingShare,
            },
          }
        : null,
      merchant,
      nextBilling: merchant?.expiresAt
        ? { date: merchant.expiresAt, daysLeft, amount: SUBSCRIPTION_SPLIT[merchant.tier].price }
        : null,
      quota: {
        tier: merchant?.tier ?? null,
        productLimit: Number.isFinite(limit) ? limit : "unlimited",
      },
      pricing: SUBSCRIPTION_SPLIT,
      history: subscriptions.map((s) => ({
        id: s.id,
        tier: s.tier,
        amount: s.amount,
        status: s.status,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        paidAt: s.paidAt,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("[API /api/merchant/subscription]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
