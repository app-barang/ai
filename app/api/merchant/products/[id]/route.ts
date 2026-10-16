import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sahkan produk milik merchant yang login */
async function ownedProduct(productId: string, merchantId: string) {
  const product = await withDbRetry(() =>
    prisma.product.findUnique({ where: { id: productId } })
  );
  if (!product) return { error: "Produk tidak dijumpai", status: 404 as const };
  if (product.merchantId !== merchantId) {
    return { error: "Produk ini bukan milik anda", status: 403 as const };
  }
  return { product };
}

// ---------- GET: detail produk ----------
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;

    const res = await ownedProduct(params.id, authz.merchantId);
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }
    return NextResponse.json({ product: res.product });
  } catch (error) {
    console.error("[API /api/merchant/products/[id] GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

// ---------- PUT: kemas kini produk ----------
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;
    const { merchantId } = authz;

    const res = await ownedProduct(params.id, merchantId);
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }

    const body = await req.json().catch(() => ({}));
    const { name, description, price, comparePrice, images, category, stock, isActive, isFeatured } = body;

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (price !== undefined) {
      if (Number(price) <= 0) {
        return NextResponse.json({ error: "Harga mesti lebih dari 0" }, { status: 400 });
      }
      data.price = Number(price);
    }
    if (comparePrice !== undefined) data.comparePrice = comparePrice ? Number(comparePrice) : null;
    if (images !== undefined) data.images = images;
    if (category) data.category = category;
    if (stock !== undefined) data.stock = Number(stock);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tiada medan untuk dikemas kini" }, { status: 400 });
    }

    const updated = await withDbRetry(() =>
      prisma.product.update({ where: { id: params.id }, data })
    );

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("[API /api/merchant/products/[id] PUT]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

// ---------- DELETE: soft delete ----------
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;

    const res = await ownedProduct(params.id, authz.merchantId);
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }

    const updated = await withDbRetry(() =>
      prisma.product.update({
        where: { id: params.id },
        data: { isActive: false, isFeatured: false },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Produk dinyahaktifkan (soft delete)",
      productId: updated.id,
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("[API /api/merchant/products/[id] DELETE]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
