import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { monthPeriod } from "@/lib/bonus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const now = new Date();
    const thisMonth = monthPeriod(now);
    const lastMonth = monthPeriod(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
    const thisStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const lastStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const weekAgo = new Date(Date.now() - 7 * 864e5);

    const [
      usersByRole,
      merchantGroups,
      merchantTierGroups,
      subsThis,
      subsLast,
      clickPool,
      rentPool,
      pendingMerchants,
      pendingPayouts,
      fraudAlerts,
    ] = await Promise.all([
      withDbRetry(() => prisma.user.groupBy({ by: ["role"], _count: true })),
      withDbRetry(() => prisma.merchant.groupBy({ by: ["status"], _count: true })),
      withDbRetry(() =>
        prisma.merchant.groupBy({ by: ["tier"], where: { status: "ACTIVE" }, _count: true })
      ),
      withDbRetry(() =>
        prisma.merchantSubscription.aggregate({
          where: { status: "PAID", paidAt: { gte: thisStart } },
          _sum: { amount: true },
          _count: true,
        })
      ),
      withDbRetry(() =>
        prisma.merchantSubscription.aggregate({
          where: { status: "PAID", paidAt: { gte: lastStart, lt: thisStart } },
          _sum: { amount: true },
          _count: true,
        })
      ),
      withDbRetry(() =>
        prisma.rewardPool.findUnique({
          where: { type_period: { type: "CLICK_POOL", period: thisMonth } },
        })
      ),
      withDbRetry(() =>
        prisma.rewardPool.findUnique({
          where: { type_period: { type: "RENT_POOL", period: thisMonth } },
        })
      ),
      withDbRetry(() => prisma.merchant.count({ where: { status: "PENDING" } })),
      withDbRetry(() => prisma.payout.count({ where: { status: "PENDING" } })),
      withDbRetry(() => prisma.fraudLog.count({ where: { createdAt: { gte: weekAgo } } })),
    ]);

    const roleMap = Object.fromEntries(usersByRole.map((g) => [g.role, g._count]));
    const statusMap = Object.fromEntries(merchantGroups.map((g) => [g.status, g._count]));
    const tierMap = Object.fromEntries(merchantTierGroups.map((g) => [g.tier, g._count]));

    const revenueThis = subsThis._sum.amount ?? 0;
    const revenueLast = subsLast._sum.amount ?? 0;
    const growth =
      revenueLast > 0
        ? Number((((revenueThis - revenueLast) / revenueLast) * 100).toFixed(1))
        : revenueThis > 0
          ? 100
          : 0;

    return NextResponse.json({
      users: {
        total: usersByRole.reduce((a, g) => a + g._count, 0),
        buyers: roleMap.BUYER ?? 0,
        affiliates: roleMap.AFFILIATE ?? 0,
        merchants: roleMap.MERCHANT ?? 0,
        admins: roleMap.ADMIN ?? 0,
      },
      merchants: {
        total: merchantGroups.reduce((a, g) => a + g._count, 0),
        active: statusMap.ACTIVE ?? 0,
        pending: statusMap.PENDING ?? 0,
        suspended: statusMap.SUSPENDED ?? 0,
        expired: statusMap.EXPIRED ?? 0,
        byTier: {
          STARTER: tierMap.STARTER ?? 0,
          PRO: tierMap.PRO ?? 0,
          BUSINESS: tierMap.BUSINESS ?? 0,
        },
      },
      revenue: {
        thisMonth: Number(revenueThis.toFixed(2)),
        lastMonth: Number(revenueLast.toFixed(2)),
        growth,
        subscriptionsThisMonth: subsThis._count,
        subscriptionsLastMonth: subsLast._count,
        period: thisMonth,
      },
      pools: {
        clickPool: clickPool
          ? {
              balance: Number(clickPool.remaining.toFixed(2)),
              allocated: Number(clickPool.allocated.toFixed(2)),
              totalFund: Number(clickPool.totalFund.toFixed(2)),
              rate: clickPool.currentRate,
              clicks: clickPool.totalClicks,
            }
          : { balance: 0, allocated: 0, totalFund: 0, rate: 0, clicks: 0 },
        rentPool: rentPool
          ? {
              balance: Number(rentPool.remaining.toFixed(2)),
              allocated: Number(rentPool.allocated.toFixed(2)),
              totalFund: Number(rentPool.totalFund.toFixed(2)),
            }
          : { balance: 0, allocated: 0, totalFund: 0 },
      },
      pendingActions: {
        merchantApprovals: pendingMerchants,
        payoutRequests: pendingPayouts,
        fraudAlerts,
      },
    });
  } catch (error) {
    console.error("[API /api/admin/stats]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
