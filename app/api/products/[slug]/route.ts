import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await withDbRetry(() =>
      prisma.product.findUnique({
        where: { slug: params.slug },
        include: {
          merchant: {
            select: {
              id: true,
              businessName: true,
              tier: true,
              status: true,
              totalSales: true,
              createdAt: true,
            },
          },
        },
      })
    );

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak dijumpai" }, { status: 404 });
    }

    // Tambah kiraan paparan (tidak menjejaskan respons jika gagal)
    withDbRetry(() =>
      prisma.product.update({
        where: { id: product.id },
        data: { views: { increment: 1 } },
      })
    ).catch((e) => console.warn("[views]", (e as Error).message));

    const related = await withDbRetry(() =>
      prisma.product.findMany({
        where: {
          isActive: true,
          category: product.category,
          id: { not: product.id },
        },
        orderBy: { sold: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          images: true,
          rating: true,
          sold: true,
          isViral: true,
          viralScore: true,
        },
      })
    );

    return NextResponse.json({ product, merchant: product.merchant, related });
  } catch (error) {
    console.error("[API /api/products/[slug]]", error);
    return NextResponse.json({ error: "Gagal memuatkan produk" }, { status: 500 });
  }
}
