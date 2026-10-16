import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";
import { monthPeriod } from "@/lib/bonus";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = ["CLICK_REWARD", "RENT_REWARD", "SALE_COMMISSION", "TEAM_BONUS"];

export async function GET(req: NextRequest) {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const sp = req.nextUrl.searchParams;
    const month = sp.get("month"); // "2026-10"
    const type = sp.get("type");
    const level = sp.get("level");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));

    const where: Prisma.EarningWhereInput = { affiliateId };

    if (month) {
      const [y, m] = month.split("-").map(Number);
      if (!y || !m) return NextResponse.json({ error: "Format bulan tidak sah" }, { status: 400 });
      where.createdAt = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
    }
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json({ error: "Jenis earning tidak sah" }, { status: 400 });
      }
      where.type = type as never;
    }
    if (level) {
      where.level = Number(level);
    }

    const [items, total, summaryByType, summaryAll] = await Promise.all([
      withDbRetry(() =>
        prisma.earning.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        })
      ),
      withDbRetry(() => prisma.earning.count({ where })),
      withDbRetry(() =>
        prisma.earning.groupBy({ by: ["type"], where, _sum: { netAmount: true }, _count: true })
      ),
      withDbRetry(() => prisma.earning.aggregate({ where, _sum: { netAmount: true } })),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalNet: Number((summaryAll._sum.netAmount ?? 0).toFixed(4)),
        byType: summaryByType.map((g) => ({
          type: g.type,
          count: g._count,
          total: Number((g._sum.netAmount ?? 0).toFixed(4)),
        })),
      },
      filters: { month: month ?? monthPeriod(), type: type ?? null, level: level ? Number(level) : null },
    });
  } catch (error) {
    console.error("[API /api/affiliate/earnings]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
