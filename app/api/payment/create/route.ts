import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { SUBSCRIPTION_SPLIT } from "@/lib/bonus";
import { createChipPurchase, hasChip, savePaymentRef } from "@/lib/chip";
import type { MerchantTier } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!hasChip()) {
      return NextResponse.json(
        { error: "Payment gateway belum dikonfigurasi" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const mode = body.orderId ? "order" : "subscription";

    let amountRM = 0;
    let description = "";
    let clientName = "Pelanggan BarangViral";
    let clientEmail = "pelanggan@barangviral.store";
    let clientPhone: string | undefined;
    let metadata: Record<string, unknown> = {};
    let refData: Record<string, unknown> = {};

    if (mode === "subscription") {
      const tier = String(body.tier ?? "") as MerchantTier;
      if (!["STARTER", "PRO", "BUSINESS"].includes(tier)) {
        return NextResponse.json({ error: "Tier tidak sah" }, { status: 400 });
      }

      // Wajib log masuk sebagai merchant
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });
      }
      if (!user.merchantId) {
        return NextResponse.json({ error: "Akaun ini bukan merchant" }, { status: 403 });
      }
      if (body.merchantId && body.merchantId !== user.merchantId) {
        return NextResponse.json({ error: "Merchant tidak sepadan" }, { status: 403 });
      }

      const merchant = await withDbRetry(() =>
        prisma.merchant.findUnique({
          where: { id: user.merchantId as string },
          select: { businessName: true, phone: true },
        })
      );
      if (!merchant) {
        return NextResponse.json({ error: "Merchant tidak dijumpai" }, { status: 404 });
      }

      amountRM = SUBSCRIPTION_SPLIT[tier].price;
      description = `Langganan ${tier} — ${merchant.businessName}`;
      clientName = merchant.businessName;
      clientEmail = user.email ?? clientEmail;
      clientPhone = merchant.phone ?? undefined;
      metadata = { type: "subscription", merchantId: user.merchantId, tier };
      refData = { type: "subscription", merchantId: user.merchantId, tier };
    } else {
      // Mode order — awam
      const order = await withDbRetry(() =>
        prisma.order.findUnique({
          where: { id: String(body.orderId) },
          include: { product: { select: { name: true } } },
        })
      );
      if (!order) {
        return NextResponse.json({ error: "Pesanan tidak dijumpai" }, { status: 404 });
      }
      if (order.status !== "PENDING") {
        return NextResponse.json({ error: "Pesanan ini sudah dibayar atau batal" }, { status: 400 });
      }

      amountRM = order.totalAmount;
      description = `Pesanan ${order.orderNumber} — ${order.product?.name ?? "Produk"}`;
      clientName = order.customerName;
      clientEmail = order.customerEmail;
      clientPhone = order.customerPhone;
      metadata = { type: "order", orderId: order.id };
      refData = { type: "order", orderId: order.id };
    }

    const purchase = await createChipPurchase({
      amountRM,
      description,
      clientName,
      clientEmail,
      clientPhone,
      successRedirect: `${appUrl}/pembayaran/berjaya?ref=`,
      failureRedirect: `${appUrl}/pembayaran/gagal`,
      successCallback: `${appUrl}/api/webhook/chip`,
      metadata,
    });

    await savePaymentRef(purchase.id, refData);

    return NextResponse.json(
      {
        success: true,
        mode,
        billCode: purchase.id,
        paymentUrl: purchase.checkout_url,
        amount: amountRM,
        status: purchase.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/payment/create]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal mencipta pembayaran" },
      { status: 500 }
    );
  }
}
