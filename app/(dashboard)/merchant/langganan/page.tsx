"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet, Loader2, AlertCircle, Check, Sparkles, CreditCard } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface SubData {
  current: {
    id: string;
    tier: string;
    amount: number;
    status: string;
    periodStart: string;
    periodEnd: string;
    split: { platform: number; rentPool: number; floating: number };
  } | null;
  merchant: { businessName: string; tier: string; status: string; subscribedAt: string | null; expiresAt: string | null } | null;
  nextBilling: { date: string; daysLeft: number; amount: number } | null;
  quota: { tier: string | null; productLimit: number | string };
  pricing: Record<string, { price: number; platform: number; rentPool: number; floating: number }>;
  history: { id: string; tier: string; amount: number; status: string; periodStart: string; periodEnd: string; paidAt: string | null; createdAt: string }[];
}

const tierInfo: Record<string, { products: string; popular?: boolean; features: string[] }> = {
  STARTER: { products: "5 produk", features: ["5 produk aktif", "Akses afiliator", "AI caption"] },
  PRO: { products: "20 produk", popular: true, features: ["20 produk", "Featured listing", "Analytics + AI insight"] },
  BUSINESS: { products: "Unlimited", features: ["Produk tanpa had", "Featured listing", "Sokongan dedicated"] },
};

export default function MerchantSubscriptionPage() {
  const [data, setData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/merchant/subscription", { cache: "no-store" });
      if (!r.ok) throw new Error();
      setData(await r.json());
    } catch {
      setError("Gagal memuatkan langganan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upgrade = async (tier: string) => {
    setBusy(`pay-${tier}`);
    setError("");
    setMessage("");
    try {
      const r = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Gagal mencipta pembayaran.");
        return;
      }
      if (d.paymentUrl) window.location.href = d.paymentUrl;
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan langganan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          Langganan <span className="text-gradient">Merchant</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">Urus tier dan pembayaran bulanan anda.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-success">
          <Check className="h-4 w-4" /> {message}
        </div>
      )}

      {/* Status semasa */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
              <Wallet className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-textsec">Tier semasa</p>
              <p className="font-heading text-2xl font-extrabold">
                {data?.merchant?.tier ?? "—"}
              </p>
            </div>
          </div>
          <span
            className={
              data?.merchant?.status === "ACTIVE"
                ? "rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success"
                : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700"
            }
          >
            {data?.merchant?.status === "ACTIVE" ? "Aktif" : data?.merchant?.status ?? "—"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Yuran bulanan" value={data?.nextBilling ? formatPrice(data.nextBilling.amount) : "—"} />
          <Stat
            label="Tempoh semasa"
            value={data?.current ? `${formatDate(data.current.periodStart)} → ${formatDate(data.current.periodEnd)}` : "Belum melanggan"}
          />
          <Stat
            label="Baki hari"
            value={data?.nextBilling ? `${data.nextBilling.daysLeft} hari` : "—"}
          />
        </div>
      </div>

      {/* Pilih tier */}
      <div className="grid gap-4 lg:grid-cols-3">
        {(["STARTER", "PRO", "BUSINESS"] as const).map((t) => {
          const info = tierInfo[t];
          const price = data?.pricing?.[t]?.price ?? (t === "STARTER" ? 30 : t === "PRO" ? 99 : 199);
          const current = data?.merchant?.tier === t;
          return (
            <div
              key={t}
              className={
                info.popular
                  ? "relative rounded-2xl bg-gradient-brand p-[2px] shadow-glow"
                  : "rounded-2xl border border-gray-100 bg-white shadow-soft"
              }
            >
              <div className={info.popular ? "rounded-2xl bg-white p-5" : "p-5"}>
                {info.popular && (
                  <span className="mb-2 inline-block rounded-full bg-gradient-brand px-3 py-0.5 text-[10px] font-bold text-white">
                    PALING POPULAR
                  </span>
                )}
                <p className="font-heading font-bold">{t}</p>
                <p className="mt-2 font-heading text-3xl font-extrabold">
                  {formatPrice(price)}
                  <span className="text-xs font-medium text-textsec">/bulan</span>
                </p>
                <p className="text-xs text-textsec">{info.products}</p>
                <ul className="mt-4 space-y-1.5">
                  {info.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>

                {current ? (
                  <div className="mt-5 rounded-xl bg-success/10 py-2.5 text-center text-xs font-bold text-success">
                    Tier Semasa
                  </div>
                ) : (
                  <div className="mt-5">
                    <button
                      onClick={() => upgrade(t)}
                      disabled={busy !== null}
                      className="btn-primary w-full !py-2.5 text-xs"
                    >
                      {busy === `pay-${t}` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5" />
                      )}
                      Bayar dengan CHIP
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sejarah */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Sparkles className="h-5 w-5 text-primary" /> Sejarah Langganan
        </h2>
        {!data || data.history.length === 0 ? (
          <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
            Belum ada langganan.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-gray-50">
            {data.history.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-semibold">
                    {h.tier} • {formatPrice(h.amount)}
                  </p>
                  <p className="text-xs text-textsec">
                    {formatDate(h.periodStart)} → {formatDate(h.periodEnd)}
                  </p>
                </div>
                <span
                  className={
                    h.status === "PAID"
                      ? "rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success"
                      : "rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700"
                  }
                >
                  {h.status === "PAID" ? "Dibayar" : h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-bgalt p-4">
      <p className="text-xs text-textsec">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
