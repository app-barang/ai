import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SELECT = {
  id: true,
  username: true,
  tier: true,
  status: true,
  totalClicks: true,
  totalSales: true,
  totalEarnings: true,
  followers: true,
  createdAt: true,
} as const;

export async function GET() {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const me = await withDbRetry(() =>
      prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { level1Count: true, level2Count: true, level3Count: true, isTeamLeader: true },
      })
    );

    const l1 = await withDbRetry(() =>
      prisma.affiliate.findMany({
        where: { uplineId: affiliateId },
        select: SELECT,
        orderBy: { totalEarnings: "desc" },
        take: 20,
      })
    );

    const l1Ids = l1.map((a) => a.id);
    const l2 = l1Ids.length
      ? await withDbRetry(() =>
          prisma.affiliate.findMany({
            where: { uplineId: { in: l1Ids } },
            select: SELECT,
            orderBy: { totalEarnings: "desc" },
            take: 20,
          })
        )
      : [];

    const l2Ids = l2.map((a) => a.id);
    const l3 = l2Ids.length
      ? await withDbRetry(() =>
          prisma.affiliate.findMany({
            where: { uplineId: { in: l2Ids } },
            select: SELECT,
            orderBy: { totalEarnings: "desc" },
            take: 20,
          })
        )
      : [];

    const summarize = (
      list: typeof l1,
      totalCount: number,
      sharePct: string,
      label: string
    ) => ({
      label,
      count: totalCount,
      listed: list.length,
      share: sharePct,
      totalEarnings: Number(list.reduce((a, b) => a + b.totalEarnings, 0).toFixed(4)),
      totalClicks: list.reduce((a, b) => a + b.totalClicks, 0),
      top: list.slice(0, 3).map((a) => ({
        username: a.username,
        tier: a.tier,
        earnings: Number(a.totalEarnings.toFixed(4)),
        clicks: a.totalClicks,
      })),
    });

    return NextResponse.json({
      me: {
        isTeamLeader: me?.isTeamLeader ?? false,
      },
      levels: {
        level1: summarize(l1, me?.level1Count ?? l1.length, "60%", "Downline Direct"),
        level2: summarize(l2, me?.level2Count ?? 0, "25%", "Downline L2"),
        level3: summarize(l3, me?.level3Count ?? 0, "15%", "Downline L3"),
      },
      members: { level1: l1, level2: l2, level3: l3 },
    });
  } catch (error) {
    console.error("[API /api/affiliate/team]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
