// Produk viral untuk dropdown - Server route
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isViral: true },
      select: { id: true, name: true, price: true, slug: true, radarScore: true },
      orderBy: { radarScore: "desc" },
      take: 20,
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[API /api/products]", error);
    // Fallback mock data
    return NextResponse.json({
      products: [
        { id: "p1", name: "LED Face Mask Therapy 7 Warna", price: 49.9, slug: "led-face-mask-therapy", radarScore: 94 },
        { id: "p2", name: "Mini Portable Printer Tanpa Ink", price: 39.9, slug: "mini-printer-tanpa-ink", radarScore: 88 },
        { id: "p3", name: "Gelas Ajaib Magic", price: 19.9, slug: "gelas-ajaib-magic", radarScore: 91 },
        { id: "p4", name: "Serum Vitamin C Brightening", price: 25.9, slug: "serum-vitamin-c-brightening", radarScore: 96 },
        { id: "p5", name: "Mop 360 Putar Tanpa Tangan", price: 29.9, slug: "mop-360-putar", radarScore: 85 },
        { id: "p6", name: "Powerbank 20000mAh Fast Charge", price: 49.9, slug: "powerbank-20000mah", radarScore: 89 },
      ],
    });
  }
}