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
        affiliateId?: string;
        affiliateUsername?: string;
        productId?: string;
      };

      if (v.affiliateId && v.affiliateUsername && v.productId) {
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

        const target = new URL(result.redirectUrl, req.url);
        target.searchParams.set("ref", v.affiliateUsername);

        const res = NextResponse.redirect(target, 302);
        const cookieOpts = {
          httpOnly: true,
          sameSite: "lax" as const,
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 864e5,
          path: "/",
        };
        res.cookies.set("bv_aff", v.affiliateId, cookieOpts);
        if (result.valid) {
          res.cookies.set("bv_click", result.shortCode, cookieOpts);
        }
        return res;
      }
    }

    // 2) Fallback: rekod klik lama (jika ada)
    const click = await prisma.click.findUnique({
      where: { shortCode: code },
      include: {
        product: true,
        merchant: true,
        affiliate: { select: { username: true } },
      },
    });
    if (click) {
      const targetPath = click.product
        ? `/produk/${click.product.slug}`
        : `/merchant/${click.merchantId}`;
      const target = new URL(targetPath, req.url);
      if (click.affiliate?.username) {
        target.searchParams.set("ref", click.affiliate.username);
      }

      const res = NextResponse.redirect(target, 302);
      const cookieOpts = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 864e5,
        path: "/",
      };
      res.cookies.set("bv_aff", click.affiliateId, cookieOpts);
      if (click.isValid) {
        res.cookies.set("bv_click", click.shortCode, cookieOpts);
      }
      return res;
    }

    return NextResponse.redirect(new URL("/", req.url), 302);
  } catch (error) {
    console.error("[GET /r/[shortCode]]", error);
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}
