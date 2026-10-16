import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";
import { monthPeriod } from "@/lib/bonus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function rangeFor(period: string) {
  const [y, m] = period.split("-").map(Number);
  return {
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
}

export async function GET() {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const now = new Date();
    const thisMonth = monthPeriod(now);
    const lastMonth = monthPeriod(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
    const thisR = rangeFor(thisMonth);
    const lastR = rangeFor(lastMonth);

    const [merchant, thisOrders, lastOrders, thisClicks, lastClicks, topAffRaw] =
      await Promise.all([
        withDbRetry(() =>
          prisma.merchant.findUnique({
            where: { id: merchantId },
            select: {
              businessName: true,
              tier: true,
              status: true,
              totalClicks: true,
              totalSales: true,
              totalRevenue: true,
              expiresAt: true,
            },
          })
        ),
        withDbRetry(() =>
          prisma.order.aggregate({
            where: { merchantId, createdAt: { gte: thisR.start, lt: thisR.end } },
            _count: true,
            _sum: { totalAmount: true, merchantNet: true },
          })
        ),
        withDbRetry(() =>
          prisma.order.aggregate({
            where: { merchantId, createdAt: { gte: lastR.start, lt: lastR.end } },
            _count: true,
            _sum: { totalAmount: true, merchantNet: true },
          })
        ),
        withDbRetry(() =>
          prisma.click.count({
            where: { merchantId, createdAt: { gte: thisR.start, lt: thisR.end } },
          })
        ),
        withDbRetry(() =>
          prisma.click.count({
            where: { merchantId, createdAt: { gte: lastR.start, lt: lastR.end } },
          })
        ),
        withDbRetry(() =>
          prisma.click.groupBy({
            by: ["affiliateId"],
            where: { merchantId },
            _count: true,
            orderBy: { _count: { affiliateId: "desc" } },
            take: 5,
          })
        ),
      ]);

    const topIds = topAffRaw.map((r) => r.affiliateId);
    const affiliates = topIds.length
      ? await withDbRetry(() =>
          prisma.affiliate.findMany({
            where: { id: { in: topIds } },
            select: { id: true, username: true, tier: true },
          })
        )
      : [];
    const affMap = new Map(affiliates.map((a) => [a.id, a]));

    const topAffiliates = topAffRaw.map((r) => ({
      affiliateId: r.affiliateId,
      username: affMap.get(r.affiliateId)?.username ?? "(tidak diketahui)",
      tier: affMap.get(r.affiliateId)?.tier ?? "BRONZE",
      clicks: r._count,
    }));

    const clicks = merchant?.totalClicks ?? 0;
    const sales = merchant?.totalSales ?? 0;
    const thisSales = thisOrders._count ?? 0;
    const thisClicksN = thisClicks;

    return NextResponse.json({
      merchant,
      clicks,
      sales,
      revenue: Number((merchant?.totalRevenue ?? 0).toFixed(2)),
      conversion: clicks > 0 ? Number(((sales / clicks) * 100).toFixed(2)) : 0,
      thisMonth: {
        period: thisMonth,
        clicks: thisClicksN,
        sales: thisSales,
        revenue: Number((thisOrders._sum.totalAmount ?? 0).toFixed(2)),
        net: Number((thisOrders._sum.merchantNet ?? 0).toFixed(2)),
        conversion: thisClicksN > 0 ? Number(((thisSales / thisClicksN) * 100).toFixed(2)) : 0,
      },
      lastMonth: {
        period: lastMonth,
        clicks: lastClicks,
        sales: lastOrders._count ?? 0,
        revenue: Number((lastOrders._sum.totalAmount ?? 0).toFixed(2)),
        net: Number((lastOrders._sum.merchantNet ?? 0).toFixed(2)),
        conversion: lastClicks > 0 ? Number((((lastOrders._count ?? 0) / lastClicks) * 100).toFixed(2)) : 0,
      },
      topAffiliates,
    });
  } catch (error) {
    console.error("[API /api/merchant/stats]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
