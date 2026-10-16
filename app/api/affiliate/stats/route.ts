import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";
import { monthPeriod } from "@/lib/bonus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function rangeFor(period: string): { start: Date; end: Date } {
  const [y, m] = period.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start, end };
}

export async function GET() {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const now = new Date();
    const thisMonth = monthPeriod(now);
    const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const lastMonth = monthPeriod(prev);

    const thisRange = rangeFor(thisMonth);
    const lastRange = rangeFor(lastMonth);

    const [affiliate, thisGroups, lastGroups] = await Promise.all([
      withDbRetry(() =>
        prisma.affiliate.findUnique({
          where: { id: affiliateId },
          select: {
            username: true,
            tier: true,
            status: true,
            balance: true,
            pendingBalance: true,
            totalEarnings: true,
            totalClicks: true,
            totalSales: true,
            totalMerchants: true,
            level1Count: true,
            level2Count: true,
            level3Count: true,
          },
        })
      ),
      withDbRetry(() =>
        prisma.earning.groupBy({
          by: ["type"],
          where: { affiliateId, createdAt: { gte: thisRange.start, lt: thisRange.end } },
          _sum: { netAmount: true },
          _count: true,
        })
      ),
      withDbRetry(() =>
        prisma.earning.groupBy({
          by: ["type"],
          where: { affiliateId, createdAt: { gte: lastRange.start, lt: lastRange.end } },
          _sum: { netAmount: true },
          _count: true,
        })
      ),
    ]);

    const toMap = (groups: { type: string; _sum: { netAmount: number | null } }[]) => {
      const m: Record<string, number> = {
        CLICK_REWARD: 0,
        RENT_REWARD: 0,
        SALE_COMMISSION: 0,
        TEAM_BONUS: 0,
      };
      for (const g of groups) m[g.type] = Number((g._sum.netAmount ?? 0).toFixed(4));
      return m;
    };

    const thisByType = toMap(thisGroups);
    const lastByType = toMap(lastGroups);
    const sum = (m: Record<string, number>) =>
      Number(Object.values(m).reduce((a, b) => a + b, 0).toFixed(4));

    return NextResponse.json({
      affiliate,
      levels: {
        level1: affiliate?.level1Count ?? 0,
        level2: affiliate?.level2Count ?? 0,
        level3: affiliate?.level3Count ?? 0,
      },
      income: {
        klik: thisByType.CLICK_REWARD,
        sewa: thisByType.RENT_REWARD,
        jualan: thisByType.SALE_COMMISSION,
        team: thisByType.TEAM_BONUS,
      },
      thisMonth: { period: thisMonth, total: sum(thisByType), byType: thisByType },
      lastMonth: { period: lastMonth, total: sum(lastByType), byType: lastByType },
    });
  } catch (error) {
    console.error("[API /api/affiliate/stats]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
