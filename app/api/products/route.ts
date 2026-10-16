import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  popular: { sold: "desc" },
  viral: { viralScore: "desc" },
};

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(48, Math.max(1, Number(sp.get("limit") ?? 12)));
    const category = sp.get("category");
    const priceMin = sp.get("priceMin") ? Number(sp.get("priceMin")) : undefined;
    const priceMax = sp.get("priceMax") ? Number(sp.get("priceMax")) : undefined;
    const search = sp.get("search")?.trim();
    const sort = sp.get("sort") ?? "newest";

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && category !== "Semua" ? { category } : {}),
      ...(priceMin !== undefined || priceMax !== undefined
        ? { price: { gte: priceMin ?? undefined, lte: priceMax ?? undefined } }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [products, total, categoryGroups] = await Promise.all([
      withDbRetry(() =>
        prisma.product.findMany({
          where,
          orderBy: SORTS[sort] ?? SORTS.newest,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            comparePrice: true,
            images: true,
            category: true,
            rating: true,
            sold: true,
            stock: true,
            isViral: true,
            viralScore: true,
            viralTrend: true,
            merchant: { select: { id: true, businessName: true, tier: true } },
          },
        })
      ),
      withDbRetry(() => prisma.product.count({ where })),
      withDbRetry(() =>
        prisma.product.groupBy({
          by: ["category"],
          where: { isActive: true },
          _count: true,
          orderBy: { _count: { category: "desc" } },
        })
      ),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      categories: categoryGroups.map((g) => ({ name: g.category, count: g._count })),
      filters: { category: category ?? "Semua", search: search ?? null, sort },
    });
  } catch (error) {
    console.error("[API /api/products]", error);
    return NextResponse.json({ error: "Gagal memuatkan produk" }, { status: 500 });
  }
}
