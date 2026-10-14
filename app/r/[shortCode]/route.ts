// Link afiliasi /r/[shortCode] - track klik + redirect
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    // Import dinamik supaya mod demo (tiada DATABASE_URL) tidak crash
    const { prisma } = await import("@/lib/prisma");

    const link = await prisma.affLink.findUnique({
      where: { shortCode: params.shortCode },
      include: { product: true },
    });

    if (!link || !link.product) {
      return NextResponse.redirect(new URL("/produk", req.url), 302);
    }

    // Rekod klik
    await prisma.affLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    // Hantar ke marketplace atau halaman produk
    const target =
      link.product.externalUrl ?? `/produk/${link.product.slug}`;

    if (target.startsWith("http")) {
      return NextResponse.redirect(target, 302);
    }
    return NextResponse.redirect(new URL(target, req.url), 302);
  } catch (error) {
    // Mod demo / DB tidak tersedia — hantar ke halaman produk
    return NextResponse.redirect(new URL("/produk", req.url), 302);
  }
}
