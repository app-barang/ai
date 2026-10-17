import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20)));

    const where = {
      merchantId,
      ...(status ? { status: status as never } : {}),
    };

    const [orders, total, summary, revenue] = await Promise.all([
      withDbRetry(() =>
        prisma.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            orderNumber: true,
            quantity: true,
            unitPrice: true,
            totalAmount: true,
            merchantNet: true,
            status: true,
            customerName: true,
            paymentMethod: true,
            createdAt: true,
            paidAt: true,
            product: { select: { name: true, slug: true } },
          },
        })
      ),
      withDbRetry(() => prisma.order.count({ where })),
      withDbRetry(() =>
        prisma.order.groupBy({ by: ["status"], where: { merchantId }, _count: true })
      ),
      withDbRetry(() =>
        prisma.order.aggregate({
          where: { merchantId, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
          _sum: { totalAmount: true, merchantNet: true },
        })
      ),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      summary: {
        byStatus: Object.fromEntries(summary.map((g) => [g.status, g._count])),
        totalRevenue: Number((revenue._sum.totalAmount ?? 0).toFixed(2)),
        totalNet: Number((revenue._sum.merchantNet ?? 0).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("[API /api/merchant/orders]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
