"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MousePointerClick,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

interface Stats {
  merchant?: { businessName: string; tier: string; status: string } | null;
  clicks: number;
  sales: number;
  revenue: number;
  conversion: number;
  thisMonth: { period: string; clicks: number; sales: number; revenue: number; net: number; conversion: number };
  lastMonth: { period: string; clicks: number; sales: number; revenue: number; net: number; conversion: number };
  topAffiliates: { affiliateId: string; username: string; tier: string; clicks: number }[];
}

const fmt = (n: number) => `RM${n.toFixed(2)}`;

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/merchant/stats", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStats)
      .catch(() => setError("Gagal memuatkan statistik."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600">
        <AlertCircle className="h-4 w-4" /> {error || "Ralat memuatkan data."}
      </div>
    );
  }

  const cards = [
    { label: "Jumlah Klik", value: stats.clicks.toLocaleString(), icon: MousePointerClick, color: "#FF6B00", sub: `${stats.thisMonth.clicks} bulan ini` },
    { label: "Jumlah Jualan", value: stats.sales.toLocaleString(), icon: ShoppingBag, color: "#FF007A", sub: `${stats.thisMonth.sales} bulan ini` },
    { label: "Hasil Jualan", value: fmt(stats.revenue), icon: Wallet, color: "#00C853", sub: `${fmt(stats.thisMonth.revenue)} bulan ini` },
    { label: "Kadar Konversi", value: `${stats.conversion}%`, icon: TrendingUp, color: "#7C3AED", sub: "jualan ÷ klik" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Ikhtisar <span className="text-gradient">Merchant</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">
            {stats.merchant?.businessName} • {stats.thisMonth.period}
          </p>
        </div>
        <Link href="/merchant/produk" className="btn-primary !py-2.5 text-sm">
          Urus Produk <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {stats.merchant?.status !== "ACTIVE" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="font-semibold">
            Akaun anda belum aktif. Langgan untuk mula jual.
          </span>
          <Link href="/merchant/langganan" className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white">
            Pilih Tier
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-soft relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} />
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${c.color}18`, color: c.color }}
            >
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-heading text-2xl font-extrabold md:text-3xl">{c.value}</p>
            <p className="mt-1 text-sm font-semibold">{c.label}</p>
            <p className="text-xs text-textsec">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bulan ini vs lepas */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="font-heading text-lg font-bold">Bulan Ini vs Bulan Lepas</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Klik", a: stats.thisMonth.clicks, b: stats.lastMonth.clicks },
              { label: "Jualan", a: stats.thisMonth.sales, b: stats.lastMonth.sales },
              { label: "Hasil", a: stats.thisMonth.revenue, b: stats.lastMonth.revenue, money: true },
            ].map((row) => {
              const max = Math.max(row.a, row.b, 1);
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{row.label}</span>
                    <span className="text-textsec">
                      {row.money ? fmt(row.a) : row.a} vs {row.money ? fmt(row.b) : row.b}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-bgalt">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(row.a / max) * 100}%` }} />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bgalt">
                      <div className="h-full rounded-full bg-gray-300" style={{ width: `${(row.b / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-[11px] text-textsec">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gradient-brand" /> Bulan ini</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300" /> Bulan lepas</span>
          </div>
        </div>

        {/* Top affiliate */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="font-heading text-lg font-bold">Top 5 Afiliator</h2>
          {stats.topAffiliates.length === 0 ? (
            <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
              Belum ada klik dari afiliator.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-gray-50">
              {stats.topAffiliates.map((a, i) => (
                <div key={a.affiliateId} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-heading text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">@{a.username}</p>
                    <p className="text-xs text-textsec">{a.tier}</p>
                  </div>
                  <span className="text-sm font-bold">{a.clicks} klik</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
