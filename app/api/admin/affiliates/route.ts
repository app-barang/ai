import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const sp = req.nextUrl.searchParams;
    const tier = sp.get("tier");
    const status = sp.get("status");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20)));

    const where = {
      ...(tier ? { tier: tier as never } : {}),
      ...(status ? { status: status as never } : {}),
    };

    const [items, total, byTier] = await Promise.all([
      withDbRetry(() =>
        prisma.affiliate.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            username: true,
            tier: true,
            status: true,
            totalClicks: true,
            totalSales: true,
            totalEarnings: true,
            balance: true,
            pendingBalance: true,
            level1Count: true,
            level2Count: true,
            level3Count: true,
            kycVerified: true,
            createdAt: true,
            user: { select: { email: true, name: true } },
          },
        })
      ),
      withDbRetry(() => prisma.affiliate.count({ where })),
      withDbRetry(() => prisma.affiliate.groupBy({ by: ["tier"], _count: true })),
    ]);

    return NextResponse.json({
      affiliates: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      summary: {
        byTier: Object.fromEntries(byTier.map((g) => [g.tier, g._count])),
      },
    });
  } catch (error) {
    console.error("[API /api/admin/affiliates]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
