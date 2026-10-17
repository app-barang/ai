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
    const severity = sp.get("severity");
    const type = sp.get("type");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));

    const where = {
      ...(severity ? { severity } : {}),
      ...(type ? { type } : {}),
    };

    const [items, total, bySeverity] = await Promise.all([
      withDbRetry(() =>
        prisma.fraudLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        })
      ),
      withDbRetry(() => prisma.fraudLog.count({ where })),
      withDbRetry(() =>
        prisma.fraudLog.groupBy({ by: ["severity"], _count: true })
      ),
    ]);

    return NextResponse.json({
      logs: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      summary: {
        bySeverity: Object.fromEntries(bySeverity.map((g) => [g.severity, g._count])),
      },
    });
  } catch (error) {
    console.error("[API /api/admin/fraud]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
