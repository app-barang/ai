import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";
import { CLICK_LEVEL_SPLIT, RENT_LEVEL_SPLIT, monthPeriod, round4, splitSubscription } from "@/lib/bonus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  CLICK_REWARD: "Bonus Klik",
  RENT_REWARD: "Bonus Sewa",
  SALE_COMMISSION: "Komisen Jualan",
  TEAM_BONUS: "Bonus Team",
};

export async function GET() {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const period = monthPeriod();
    const [y, m] = period.split("-").map(Number);
    const range = {
      gte: new Date(Date.UTC(y, m - 1, 1)),
      lt: new Date(Date.UTC(y, m, 1)),
    };

    const [pool, byType, byLevel] = await Promise.all([
      withDbRetry(() =>
        prisma.rewardPool.findUnique({
          where: { type_period: { type: "CLICK_POOL", period } },
        })
      ),
      withDbRetry(() =>
        prisma.earning.groupBy({
          by: ["type"],
          where: { affiliateId, createdAt: range },
          _sum: { netAmount: true },
          _count: true,
        })
      ),
      withDbRetry(() =>
        prisma.earning.groupBy({
          by: ["level"],
          where: { affiliateId, createdAt: range },
          _sum: { netAmount: true },
          _count: true,
        })
      ),
    ]);

    const rate = pool?.currentRate ?? 0.01;
    const rm = (n: number, dp = 4) => `RM${n.toFixed(dp)}`;

    const fmt = (splits: number[], base: number, dp = 4) =>
      splits.map(
        (s, i) => `L${i + 1}: ${Math.round(s * 100)}% × ${rm(base, dp)} = ${rm(base * s, dp)}`
      );

    // Contoh Bonus Sewa: Rent Pool STARTER = 30% × RM30 = RM9.00
    const rentPoolExample = splitSubscription("STARTER").rentPoolShare;

    const formulas = {
      CLICK_REWARD: {
        label: TYPE_LABEL.CLICK_REWARD,
        source: "Floating Fund (30/25/20% langganan mengikut tier)",
        rateLabel: `Kadar semasa: ${rm(rate)} / klik`,
        split: CLICK_LEVEL_SPLIT.map((s) => Math.round(s * 100)),
        example: fmt(CLICK_LEVEL_SPLIT, rate),
        levels: CLICK_LEVEL_SPLIT.map((s, i) => ({
          level: i + 1,
          percent: Math.round(s * 100),
          rate,
          amount: round4(rate * s),
        })),
        cap: "RM500 / bulan",
      },
      RENT_REWARD: {
        label: TYPE_LABEL.RENT_REWARD,
        source: "Rent Pool sahaja (30% STARTER / 25% PRO / 20% BUSINESS)",
        rateLabel: `Contoh STARTER: 30% × RM30 = ${rm(rentPoolExample, 2)} Rent Pool`,
        split: RENT_LEVEL_SPLIT.map((s) => Math.round(s * 100)),
        example: fmt(RENT_LEVEL_SPLIT, rentPoolExample, 2),
        levels: RENT_LEVEL_SPLIT.map((s, i) => ({
          level: i + 1,
          percent: Math.round(s * 100),
          rate: rentPoolExample,
          amount: round4(rentPoolExample * s),
        })),
        cap: "RM2,000 / bulan",
      },
      SALE_COMMISSION: {
        label: TYPE_LABEL.SALE_COMMISSION,
        source: "Komisen jualan produk",
        rateLabel: "30% dari margin platform",
        split: [100],
        example: ["Jualan × Margin Platform × 30%"],
        levels: [],
        cap: null,
      },
      TEAM_BONUS: {
        label: TYPE_LABEL.TEAM_BONUS,
        source: "Dari Platform (bukan dari team)",
        rateLabel: "Coach 5–30 ahli team",
        split: [],
        example: ["RM100 (5 ahli) → RM2,000 (30+ ahli)"],
        levels: [],
        cap: "RM2,000 / bulan",
      },
    };

    return NextResponse.json({
      period,
      byType: byType.map((g) => ({
        type: g.type,
        label: TYPE_LABEL[g.type] ?? g.type,
        count: g._count,
        total: Number((g._sum.netAmount ?? 0).toFixed(4)),
      })),
      byLevel: byLevel.map((g) => ({
        level: g.level,
        description:
          g.level === 1 ? "Klik/Jualan sendiri" : `Downline L${g.level}`,
        count: g._count,
        total: Number((g._sum.netAmount ?? 0).toFixed(4)),
      })),
      formulas,
    });
  } catch (error) {
    console.error("[API /api/affiliate/earnings/breakdown]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
