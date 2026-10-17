import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";
import { generateShortCode } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONE_YEAR = 365 * 864e5;

// ---------- POST: jana link afiliasi ----------
export async function POST(req: NextRequest) {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const body = await req.json().catch(() => ({}));
    const productId = String(body.productId ?? "");
    if (!productId) {
      return NextResponse.json({ error: "productId diperlukan" }, { status: 400 });
    }

    const [affiliate, product] = await Promise.all([
      withDbRetry(() =>
        prisma.affiliate.findUnique({
          where: { id: affiliateId },
          select: { username: true },
        })
      ),
      withDbRetry(() =>
        prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, slug: true, isActive: true },
        })
      ),
    ]);

    if (!affiliate) return NextResponse.json({ error: "Afiliator tidak dijumpai" }, { status: 404 });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak dijumpai" }, { status: 404 });
    }

    const shortCode = generateShortCode();
    await withDbRetry(() =>
      prisma.aICache.create({
        data: {
          key: `link:${shortCode}`,
          value: {
            affiliateId,
            affiliateUsername: affiliate.username,
            productId,
            productSlug: product.slug,
            productName: product.name,
          } as never,
          expiresAt: new Date(Date.now() + ONE_YEAR),
        },
      })
    );

    const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    return NextResponse.json(
      {
        success: true,
        shortCode,
        url: `${base}/r/${shortCode}`,
        path: `/r/${shortCode}`,
        product: { id: product.id, name: product.name, slug: product.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/affiliate/link POST]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

// ---------- GET: senarai link yang dijana ----------
export async function GET() {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const rows = await withDbRetry(() =>
      prisma.aICache.findMany({
        where: { key: { startsWith: "link:" } },
        orderBy: { createdAt: "desc" },
        take: 300,
      })
    );

    const mine = rows.filter(
      (r) => (r.value as { affiliateId?: string })?.affiliateId === affiliateId
    );

    const productIds = Array.from(
      new Set(
        mine
          .map((r) => (r.value as { productId?: string })?.productId)
          .filter((x): x is string => Boolean(x))
      )
    );

    const [products, clickGroups] = await Promise.all([
      productIds.length
        ? withDbRetry(() =>
            prisma.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, name: true, slug: true, price: true },
            })
          )
        : Promise.resolve([]),
      withDbRetry(() =>
        prisma.click.groupBy({
          by: ["productId"],
          where: { affiliateId, isValid: true, productId: { in: productIds } },
          _count: true,
        })
      ),
    ]);

    const pMap = new Map(products.map((p) => [p.id, p]));
    const cMap = new Map(clickGroups.map((g) => [g.productId ?? "", g._count]));

    const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    const links = mine.map((r) => {
      const v = r.value as {
        productId?: string;
        productName?: string;
        productSlug?: string;
      };
      const p = v.productId ? pMap.get(v.productId) : undefined;
      return {
        shortCode: r.key.replace("link:", ""),
        url: `${base}/r/${r.key.replace("link:", "")}`,
        productId: v.productId,
        productName: p?.name ?? v.productName ?? "Produk",
        productSlug: p?.slug ?? v.productSlug,
        price: p?.price ?? null,
        clicks: cMap.get(v.productId ?? "") ?? 0,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ links, total: links.length });
  } catch (error) {
    console.error("[API /api/affiliate/link GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
