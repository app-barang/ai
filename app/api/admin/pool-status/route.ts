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

    const period = monthPeriod();

    const [pools, byType, earningsByType] = await Promise.all([
      withDbRetry(() =>
        prisma.rewardPool.findMany({ orderBy: [{ period: "desc" }, { type: "asc" }] })
      ),
      withDbRetry(() =>
        prisma.rewardPool.aggregate({
          where: { period },
          _sum: { totalFund: true, allocated: true, remaining: true },
          _count: true,
        })
      ),
      withDbRetry(() =>
        prisma.earning.groupBy({
          by: ["type"],
          where: {
            createdAt: {
              gte: new Date(`${period}-01T00:00:00.000Z`),
            },
          },
          _sum: { netAmount: true },
          _count: true,
        })
      ),
    ]);

    const current = pools.filter((p) => p.period === period);

    return NextResponse.json({
      period,
      pools: pools.map((p) => ({
        id: p.id,
        type: p.type,
        period: p.period,
        totalFund: Number(p.totalFund.toFixed(2)),
        allocated: Number(p.allocated.toFixed(2)),
        reserved: Number(p.reserved.toFixed(2)),
        remaining: Number(p.remaining.toFixed(2)),
        utilization:
          p.totalFund > 0 ? Number(((p.allocated / p.totalFund) * 100).toFixed(1)) : 0,
        totalClicks: p.totalClicks,
        totalEarners: p.totalEarners,
        currentRate: p.currentRate,
        status: p.status,
      })),
      currentMonth: {
        pools: current.length,
        totalFund: Number((byType._sum.totalFund ?? 0).toFixed(2)),
        allocated: Number((byType._sum.allocated ?? 0).toFixed(2)),
        remaining: Number((byType._sum.remaining ?? 0).toFixed(2)),
      },
      earnings: earningsByType.map((g) => ({
        type: g.type,
        count: g._count,
        total: Number((g._sum.netAmount ?? 0).toFixed(2)),
      })),
    });
  } catch (error) {
    console.error("[API /api/admin/pool-status]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
