import { NextRequest, NextResponse } from "next/server";
import { getChipPurchase, getPaymentRef, hasChip } from "@/lib/chip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_MS: Record<string, string> = {
  created: "Menunggu pembayaran",
  sent: "Pautan dihantar",
  viewed: "Sedang dilihat",
  paid: "Telah dibayar",
  expired: "Tamat tempoh",
  cancelled: "Dibatalkan",
  error: "Ralat",
  blocked: "Disekat",
  pending_capture: "Menunggu tangkapan",
  preauthorized: "Prabenarkan",
  charged_back: "Caj balik",
  refunded: "Dikembalikan",
  cleared: "Selesai",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { billCode: string } }
) {
  try {
    if (!hasChip()) {
      return NextResponse.json({ error: "Gateway tidak dikonfigurasi" }, { status: 503 });
    }

    const purchase = await getChipPurchase(params.billCode);
    const ref = await getPaymentRef(params.billCode);

    return NextResponse.json({
      billCode: purchase.id,
      status: purchase.status,
      statusLabel: STATUS_MS[purchase.status] ?? purchase.status,
      paid: purchase.status === "paid",
      amount: purchase.purchase?.total ? purchase.purchase.total / 100 : (ref?.amount ?? null),
      currency: purchase.purchase?.currency ?? "MYR",
      reference: ref ?? null,
      checkoutUrl: purchase.checkout_url ?? null,
    });
  } catch (error) {
    console.error("[API /api/payment/status]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal menyemak status" },
      { status: 500 }
    );
  }
}
