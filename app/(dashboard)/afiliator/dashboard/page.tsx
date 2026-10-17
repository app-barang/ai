"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MousePointerClick,
  HandCoins,
  ShoppingBag,
  Trophy,
  Loader2,
  AlertCircle,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  affiliate: {
    username: string;
    tier: string;
    status: string;
    balance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalClicks: number;
    totalSales: number;
    totalMerchants: number;
  } | null;
  levels: { level1: number; level2: number; level3: number };
  income: { klik: number; sewa: number; jualan: number; team: number };
  thisMonth: { period: string; total: number; byType: Record<string, number> };
  lastMonth: { period: string; total: number; byType: Record<string, number> };
}

const incomeCards = [
  { key: "klik", label: "Bonus Klik", icon: MousePointerClick, color: "#FF6B00", cap: "Cap RM500" },
  { key: "sewa", label: "Bonus Sewa", icon: HandCoins, color: "#FF007A", cap: "Cap RM2,000" },
  { key: "jualan", label: "Komisen Jualan", icon: ShoppingBag, color: "#00C853", cap: "30% margin" },
  { key: "team", label: "Team Bonus", icon: Trophy, color: "#7C3AED", cap: "RM100–2,000" },
] as const;

export default function AffiliateDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/affiliate/stats", { cache: "no-store" })
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
        <AlertCircle className="h-4 w-4" /> {error || "Ralat."}
      </div>
    );
  }

  const growth =
    stats.lastMonth.total > 0
      ? Math.round(((stats.thisMonth.total - stats.lastMonth.total) / stats.lastMonth.total) * 100)
      : stats.thisMonth.total > 0
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Ikhtisar <span className="text-gradient">Afiliator</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">
            @{stats.affiliate?.username} • {stats.affiliate?.tier} • {stats.thisMonth.period}
          </p>
        </div>
        <Link href="/afiliator/link" className="btn-primary !py-2.5 text-sm">
          Jana Link <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Baki + bulan ini */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-brand p-5 text-white shadow-glow md:col-span-2">
          <p className="text-xs uppercase tracking-wider text-white/80">Baki boleh keluar</p>
          <p className="mt-1 font-heading text-4xl font-extrabold">
            {formatPrice(stats.affiliate?.balance ?? 0)}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/90">
            <span>Pending: {formatPrice(stats.affiliate?.pendingBalance ?? 0)}</span>
            <span>Jumlah pendapatan: {formatPrice(stats.affiliate?.totalEarnings ?? 0)}</span>
          </div>
          <Link
            href="/afiliator/wallet"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-primary"
          >
            <Wallet className="h-3.5 w-3.5" /> Urus Wallet
          </Link>
        </div>
        <div className="card-soft">
          <p className="text-xs uppercase tracking-wider text-textsec">Bulan ini</p>
          <p className="mt-1 font-heading text-3xl font-extrabold text-gradient">
            {formatPrice(stats.thisMonth.total)}
          </p>
          <p className={`mt-1 text-sm font-bold ${growth >= 0 ? "text-success" : "text-red-500"}`}>
            {growth > 0 ? "+" : ""}
            {growth}% vs bulan lepas
          </p>
          <p className="mt-2 text-xs text-textsec">
            {stats.affiliate?.totalClicks ?? 0} klik • {stats.affiliate?.totalSales ?? 0} jualan
          </p>
        </div>
      </div>

      {/* 4 income */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {incomeCards.map((c) => (
          <div key={c.key} className="card-soft relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} />
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${c.color}18`, color: c.color }}
            >
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-heading text-2xl font-extrabold">
              {formatPrice(stats.income[c.key])}
            </p>
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="text-xs text-textsec">{c.cap}</p>
          </div>
        ))}
      </div>

      {/* Level team */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold">Struktur Team (3 Level)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Level 1", value: stats.levels.level1, share: "60%" },
            { label: "Level 2", value: stats.levels.level2, share: "25% / 30%" },
            { label: "Level 3", value: stats.levels.level3, share: "15% / 10%" },
          ].map((l) => (
            <div key={l.label} className="rounded-2xl bg-bgalt p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-textsec">{l.label}</p>
              <p className="mt-1 font-heading text-3xl font-extrabold">{l.value}</p>
              <p className="text-xs text-textsec">ahli • agihan {l.share}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-primary/5 p-3 text-xs text-gray-600">
          Bonus dibayar oleh <strong>platform</strong> — bukan dari poket downline. Struktur 3 level sah.
        </p>
      </div>
    </div>
  );
}
