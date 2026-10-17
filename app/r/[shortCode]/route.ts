import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processClick } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const code = params.shortCode;

  try {
    // 1) Link yang dijana afiliator (disimpan dalam AICache)
    const link = await prisma.aICache.findUnique({ where: { key: `link:${code}` } });
    if (link) {
      const v = link.value as {
        affiliateUsername?: string;
        productId?: string;
      };

      if (v.affiliateUsername && v.productId) {
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          "0.0.0.0";

        // Rekod klik + agihan bonus (proses yang sama seperti API track)
        const result = await processClick({
          affiliateUsername: v.affiliateUsername,
          productId: v.productId,
          ip,
          userAgent: req.headers.get("user-agent"),
          referrer: req.headers.get("referer"),
        });

        return NextResponse.redirect(new URL(result.redirectUrl, req.url), 302);
      }
    }

    // 2) Fallback: rekod klik lama (jika ada)
    const click = await prisma.click.findUnique({
      where: { shortCode: code },
      include: { product: true, merchant: true },
    });
    if (click) {
      const target = click.product ? `/produk/${click.product.slug}` : `/merchant/${click.merchantId}`;
      return NextResponse.redirect(new URL(target, req.url), 302);
    }

    return NextResponse.redirect(new URL("/", req.url), 302);
  } catch (error) {
    console.error("[GET /r/[shortCode]]", error);
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}
