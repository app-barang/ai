import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Halaman merchant awam.
 * [slug] boleh jadi: id merchant ATAU slug nama bisnes (cth "techgadget-my")
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Cuba padan ikut id dahulu
    let merchant = await withDbRetry(() =>
      prisma.merchant.findUnique({
        where: { id: params.slug },
        select: {
          id: true,
          businessName: true,
          businessType: true,
          tier: true,
          status: true,
          totalClicks: true,
          totalSales: true,
          createdAt: true,
        },
      })
    );

    // Jika tak jumpa, padan ikut slug nama bisnes
    if (!merchant) {
      const all = await withDbRetry(() =>
        prisma.merchant.findMany({
          select: {
            id: true,
            businessName: true,
            businessType: true,
            tier: true,
            status: true,
            totalClicks: true,
            totalSales: true,
            createdAt: true,
          },
        })
      );
      merchant = all.find((m) => slugify(m.businessName) === params.slug) ?? null;
    }

    if (!merchant) {
      return NextResponse.json({ error: "Merchant tidak dijumpai" }, { status: 404 });
    }

    const products = await withDbRetry(() =>
      prisma.product.findMany({
        where: { merchantId: merchant!.id, isActive: true },
        orderBy: { sold: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          images: true,
          category: true,
          rating: true,
          sold: true,
          isViral: true,
          viralScore: true,
        },
      })
    );

    return NextResponse.json({
      merchant: {
        ...merchant,
        slug: slugify(merchant.businessName),
        productCount: products.length,
        isActive: merchant.status === "ACTIVE",
      },
      products,
    });
  } catch (error) {
    console.error("[API /api/merchant/[slug]]", error);
    return NextResponse.json({ error: "Gagal memuatkan merchant" }, { status: 500 });
  }
}
