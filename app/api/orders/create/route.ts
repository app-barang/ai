import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { saleCommissionSplit } from "@/lib/bonus";
import { rateLimit } from "@/lib/rate-limit";
import { generateShortCode } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Cipta order PENDING.
 * Harga & split diambil dari DB — tidak mempercayai nilai dari client.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!rateLimit(`order:${ip}`, 20, 60_000).success) {
      return NextResponse.json(
        { error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const productId = text(body.productId, 100);
    const quantity = Number(body.quantity ?? 1);
    const customerName = text(body.customerName, 120);
    const customerEmail = text(body.customerEmail, 160).toLowerCase();
    const customerPhone = text(body.customerPhone, 40);
    const clickCode = text(body.clickCode, 40);
    const affiliateKey = text(
      body.affiliateId ?? body.affiliateUsername ?? body.ref,
      120
    );

    if (!productId) {
      return NextResponse.json({ error: "Produk diperlukan" }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Kuantiti mesti antara 1 hingga 10" },
        { status: 400 }
      );
    }
    if (customerName.length < 2) {
      return NextResponse.json({ error: "Nama penuh diperlukan" }, { status: 400 });
    }
    if (!EMAIL_RE.test(customerEmail)) {
      return NextResponse.json({ error: "Format email tidak sah" }, { status: 400 });
    }
    if (customerPhone.replace(/\D/g, "").length < 9) {
      return NextResponse.json({ error: "No. telefon tidak sah" }, { status: 400 });
    }

    const product = await withDbRetry(() =>
      prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          isActive: true,
          merchantId: true,
        },
      })
    );

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak dijumpai" }, { status: 404 });
    }
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }
    if (product.price <= 0) {
      return NextResponse.json({ error: "Harga produk tidak sah" }, { status: 400 });
    }

    // ---------- Attribution afiliator ----------
    let affiliateId: string | null = null;
    let clickId: string | null = null;

    if (clickCode) {
      const click = await withDbRetry(() =>
        prisma.click.findUnique({
          where: { shortCode: clickCode },
          include: { affiliate: { select: { status: true } } },
        })
      );

      if (
        !click ||
        !click.isValid ||
        click.productId !== product.id ||
        click.affiliate.status !== "ACTIVE"
      ) {
        return NextResponse.json(
          { error: "Pautan afiliator tidak sah atau telah tamat" },
          { status: 400 }
        );
      }

      affiliateId = click.affiliateId;
      clickId = click.id;
    } else if (affiliateKey) {
      const affiliate = await withDbRetry(() =>
        prisma.affiliate.findFirst({
          where: {
            status: "ACTIVE",
            OR: [{ id: affiliateKey }, { username: affiliateKey }],
          },
          select: { id: true },
        })
      );

      if (!affiliate) {
        return NextResponse.json(
          { error: "Rujukan afiliator tidak sah atau tidak aktif" },
          { status: 400 }
        );
      }
      affiliateId = affiliate.id;
    }

    // ---------- Kiraan kewangan ----------
    const totalAmount = Math.round(product.price * quantity * 100) / 100;
    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Jumlah pesanan tidak sah" }, { status: 400 });
    }

    const split = saleCommissionSplit(totalAmount, !!affiliateId);
    const orderNumber = `BV-${Date.now().toString(36).toUpperCase()}-${generateShortCode(4).toUpperCase()}`;

    const order = await withDbRetry(() =>
      prisma.order.create({
        data: {
          orderNumber,
          merchantId: product.merchantId,
          productId: product.id,
          quantity,
          unitPrice: product.price,
          totalAmount,
          platformFee: split.platformFee,
          merchantNet: split.merchantNet,
          affiliateId,
          affiliateCommission: split.affiliateCommission,
          clickId,
          customerName,
          customerEmail,
          customerPhone,
          status: "PENDING",
        },
        select: {
          id: true,
          orderNumber: true,
          quantity: true,
          unitPrice: true,
          totalAmount: true,
          platformFee: true,
          merchantNet: true,
          affiliateId: true,
          affiliateCommission: true,
          status: true,
        },
      })
    );

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("[API /api/orders/create]", error);
    return NextResponse.json({ error: "Gagal mencipta pesanan" }, { status: 500 });
  }
}
