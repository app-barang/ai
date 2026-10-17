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
    const status = sp.get("status");
    const tier = sp.get("tier");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20)));

    const where = {
      ...(status ? { status: status as never } : {}),
      ...(tier ? { tier: tier as never } : {}),
    };

    const [items, total] = await Promise.all([
      withDbRetry(() =>
        prisma.merchant.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            businessName: true,
            businessType: true,
            phone: true,
            tier: true,
            status: true,
            subscribedAt: true,
            expiresAt: true,
            totalClicks: true,
            totalSales: true,
            totalRevenue: true,
            createdAt: true,
            user: { select: { email: true, name: true } },
            _count: { select: { products: true } },
          },
        })
      ),
      withDbRetry(() => prisma.merchant.count({ where })),
    ]);

    return NextResponse.json({
      merchants: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error("[API /api/admin/merchants GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const body = await req.json().catch(() => ({}));
    const { merchantId, action } = body;
    if (!merchantId || !action) {
      return NextResponse.json(
        { error: "merchantId dan action diperlukan" },
        { status: 400 }
      );
    }

    const map: Record<string, string> = {
      approve: "ACTIVE",
      activate: "ACTIVE",
      suspend: "SUSPENDED",
      expire: "EXPIRED",
      pending: "PENDING",
    };
    const status = map[String(action)];
    if (!status) {
      return NextResponse.json(
        { error: "action tidak sah (approve/suspend/expire/pending)" },
        { status: 400 }
      );
    }

    const updated = await withDbRetry(() =>
      prisma.merchant.update({
        where: { id: merchantId },
        data: {
          status: status as never,
          ...(status === "ACTIVE" ? { subscribedAt: new Date() } : {}),
        },
        select: { id: true, businessName: true, status: true, tier: true },
      })
    );

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error) {
    console.error("[API /api/admin/merchants PUT]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
