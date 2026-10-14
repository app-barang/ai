// Senarai link afiliasi + pendapatan - API
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Tidak berkebenaran" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id?: string }).id },
      include: { affiliate: true },
    });

    if (!user?.affiliate) {
      return NextResponse.json({ error: "Bukan afiliator" }, { status: 403 });
    }

    const links = await prisma.affLink.findMany({
      where: { affiliateId: user.affiliate.id },
      include: {
        product: { select: { name: true, slug: true, price: true, marketplace: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      links: links.map((l) => ({
        id: l.id,
        shortCode: l.shortCode,
        productId: l.productId,
        productName: l.product?.name ?? "Produk",
        slug: l.product?.slug,
        price: l.product?.price ?? 0,
        marketplace: l.product?.marketplace,
        clicks: l.clicks,
        conversions: l.conversions,
        earnings: l.earnings,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error("[API /api/affiliate/commissions]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
