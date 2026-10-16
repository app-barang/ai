import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const click = await prisma.click.findUnique({
      where: { shortCode: params.shortCode },
      include: { product: true, merchant: true },
    });

    if (!click) {
      return NextResponse.redirect(new URL("/", req.url), 302);
    }

    const target = click.product
      ? `/produk/${click.product.slug}`
      : `/merchant/${click.merchantId}`;

    return NextResponse.redirect(new URL(target, req.url), 302);
  } catch (error) {
    console.error("[GET /r/[shortCode]]", error);
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}
