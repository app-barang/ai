import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";
import { PRODUCT_LIMITS } from "@/lib/bonus";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- GET: senarai produk merchant (paginated) ----------
export async function GET(req: NextRequest) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20)));
    const includeInactive = sp.get("all") === "true";

    const where = {
      merchantId,
      ...(includeInactive ? {} : { isActive: true }),
    };

    const [items, total] = await Promise.all([
      withDbRetry(() =>
        prisma.product.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        })
      ),
      withDbRetry(() => prisma.product.count({ where })),
    ]);

    return NextResponse.json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error("[API /api/merchant/products GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

// ---------- POST: tambah produk baru ----------
export async function POST(req: NextRequest) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const body = await req.json().catch(() => ({}));
    const { name, description, price, comparePrice, images, category, stock } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Nama, deskripsi, harga dan kategori diperlukan" },
        { status: 400 }
      );
    }
    if (Number(price) <= 0) {
      return NextResponse.json({ error: "Harga mesti lebih dari 0" }, { status: 400 });
    }

    const merchant = await withDbRetry(() =>
      prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { tier: true, status: true, businessName: true },
      })
    );
    if (!merchant) {
      return NextResponse.json({ error: "Merchant tidak dijumpai" }, { status: 404 });
    }
    if (merchant.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akaun belum aktif — sila langgan dahulu" },
        { status: 403 }
      );
    }

    // Semak had produk ikut tier
    const currentCount = await withDbRetry(() =>
      prisma.product.count({ where: { merchantId, isActive: true } })
    );
    const limit = PRODUCT_LIMITS[merchant.tier];
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: `Had produk tier ${merchant.tier} ialah ${limit}. Naik taraf untuk tambah lebih.`,
          current: currentCount,
          limit,
        },
        { status: 403 }
      );
    }

    // Jana slug unik
    let slug = slugify(String(name));
    const clash = await withDbRetry(() => prisma.product.findUnique({ where: { slug } }));
    if (clash) slug = `${slug}-${Math.floor(Math.random() * 9000) + 1000}`;
    const clash2 = await withDbRetry(() => prisma.product.findUnique({ where: { slug } }));
    if (clash2) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const product = await withDbRetry(() =>
      prisma.product.create({
        data: {
          merchantId,
          name,
          slug,
          description,
          price: Number(price),
          comparePrice: comparePrice ? Number(comparePrice) : null,
          images: Array.isArray(images) && images.length > 0 ? images : ["/placeholder-product.svg"],
          category,
          stock: Number(stock) || 0,
        },
      })
    );

    return NextResponse.json(
      {
        success: true,
        product,
        quota: {
          used: currentCount + 1,
          limit: Number.isFinite(limit) ? limit : "unlimited",
          tier: merchant.tier,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/merchant/products POST]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
