"use client";

import { useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface BuyNowButtonProps {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  affiliateId?: string;
  clickCode?: string;
}

interface CreatedOrder {
  id: string;
  orderNumber: string;
}

export default function BuyNowButton({
  productId,
  productName,
  price,
  stock,
  affiliateId,
  clickCode,
}: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedOrder | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const soldOut = stock <= 0;

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      let order = created;

      if (!order) {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            quantity: 1,
            affiliateId: affiliateId || undefined,
            clickCode: clickCode || undefined,
            ...form,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.order) {
          throw new Error(data?.error || "Gagal mencipta pesanan.");
        }
        order = { id: data.order.id, orderNumber: data.order.orderNumber };
        setCreated(order);
      }

      const pay = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const payment = await pay.json().catch(() => ({}));
      if (!pay.ok || !payment?.paymentUrl) {
        throw new Error(
          payment?.error ||
            `Pesanan ${order.orderNumber} telah dicipta, tetapi pembayaran gagal dimulakan. Sila cuba lagi.`
        );
      }

      window.location.href = payment.paymentUrl as string;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ralat sambungan. Sila cuba lagi."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        disabled={soldOut}
        className="btn-primary w-full !py-3.5 text-base"
      >
        <ShoppingBag className="h-5 w-5" />
        {soldOut ? "Stok Habis" : "Beli Sekarang"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => {
            if (!busy) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="buy-now-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Beli Sekarang
                </p>
                <h2
                  id="buy-now-title"
                  className="mt-1 font-heading text-xl font-extrabold text-secondary"
                >
                  {productName}
                </h2>
                <p className="mt-1 font-heading text-2xl font-extrabold text-primary">
                  {formatPrice(price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-bgalt hover:text-gray-700 disabled:opacity-50"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="buy-name" className="mb-1.5 block text-sm font-semibold">
                  Nama Penuh
                </label>
                <input
                  id="buy-name"
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  placeholder="Nama penerima"
                  autoComplete="name"
                  required
                  minLength={2}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="buy-email" className="mb-1.5 block text-sm font-semibold">
                  Email
                </label>
                <input
                  id="buy-email"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => update("customerEmail", e.target.value)}
                  placeholder="anda@email.com"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="buy-phone" className="mb-1.5 block text-sm font-semibold">
                  No. Telefon
                </label>
                <input
                  id="buy-phone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => update("customerPhone", e.target.value)}
                  placeholder="01X-XXXXXXX"
                  autoComplete="tel"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full !py-3"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {busy ? "Memproses..." : "Bayar dengan CHIP"}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-textsec">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Pembayaran selamat melalui CHIP. Pesanan diproses oleh merchant.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
