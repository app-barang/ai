"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  DollarSign,
  Droplets,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Banknote,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AdminStats {
  users: { total: number; buyers: number; affiliates: number; merchants: number; admins: number };
  merchants: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    expired: number;
    byTier: { STARTER: number; PRO: number; BUSINESS: number };
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    subscriptionsThisMonth: number;
    subscriptionsLastMonth: number;
    period: string;
  };
  pools: {
    clickPool: { balance: number; allocated: number; totalFund: number; rate: number; clicks: number };
    rentPool: { balance: number; allocated: number; totalFund: number };
  };
  pendingActions: { merchantApprovals: number; payoutRequests: number; fraudAlerts: number };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Gagal memuatkan statistik admin."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan...
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600">
        <AlertCircle className="h-4 w-4" /> {error || "Ralat."}
      </div>
    );
  }

  const cards = [
    { label: "Pengguna", value: data.users.total, sub: `${data.users.affiliates} afiliator • ${data.users.merchants} merchant`, icon: Users, color: "#FF6B00" },
    { label: "Merchant Aktif", value: data.merchants.active, sub: `${data.merchants.pending} menunggu kelulusan`, icon: Store, color: "#FF007A" },
    { label: "Hasil Langganan", value: formatPrice(data.revenue.thisMonth), sub: `${data.revenue.growth > 0 ? "+" : ""}${data.revenue.growth}% vs bulan lepas`, icon: DollarSign, color: "#00C853" },
    { label: "Payout Menunggu", value: data.pendingActions.payoutRequests, sub: "perlu tindakan", icon: Banknote, color: "#7C3AED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Panel <span className="text-gradient">Pentadbir</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">{data.revenue.period} • ringkasan platform</p>
        </div>
        <Link href="/admin/merchants" className="btn-primary !py-2.5 text-sm">
          Urus Merchant <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

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
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="text-xs text-textsec">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Store className="h-5 w-5 text-primary" /> Merchant Ikut Tier
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(["STARTER", "PRO", "BUSINESS"] as const).map((t) => (
              <div key={t} className="rounded-2xl bg-bgalt p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-textsec">{t}</p>
                <p className="mt-1 font-heading text-2xl font-extrabold">{data.merchants.byTier[t]}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-textsec">Aktif</span>
              <span className="font-semibold text-success">{data.merchants.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textsec">Menunggu</span>
              <span className="font-semibold text-amber-600">{data.merchants.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textsec">Digantung</span>
              <span className="font-semibold text-red-500">{data.merchants.suspended}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Droplets className="h-5 w-5 text-primary" /> Status Pool
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-bgalt p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Click Pool</p>
                <span className="text-xs font-semibold text-primary">
                  RM{data.pools.clickPool.rate.toFixed(3)}/klik
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-brand"
                  style={{
                    width: `${Math.min(100, data.pools.clickPool.totalFund > 0 ? (data.pools.clickPool.allocated / data.pools.clickPool.totalFund) * 100 : 0)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-textsec">
                Baki {formatPrice(data.pools.clickPool.balance)} • {data.pools.clickPool.clicks} klik
              </p>
            </div>
            <div className="rounded-2xl bg-bgalt p-4">
              <p className="text-sm font-bold">Rent Pool</p>
              <p className="mt-1 text-xs text-textsec">
                Dana {formatPrice(data.pools.rentPool.totalFund)} • Baki{" "}
                {formatPrice(data.pools.rentPool.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/merchants" className="card-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-textsec">Kelulusan merchant</p>
            <p className="font-heading text-2xl font-extrabold">{data.pendingActions.merchantApprovals}</p>
          </div>
          <Store className="h-6 w-6 text-primary" />
        </Link>
        <Link href="/admin/payouts" className="card-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-textsec">Permintaan payout</p>
            <p className="font-heading text-2xl font-extrabold">{data.pendingActions.payoutRequests}</p>
          </div>
          <Banknote className="h-6 w-6 text-success" />
        </Link>
        <Link href="/admin/fraud" className="card-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-textsec">Amaran fraud (7 hari)</p>
            <p className="font-heading text-2xl font-extrabold">{data.pendingActions.fraudAlerts}</p>
          </div>
          <ShieldAlert className="h-6 w-6 text-red-500" />
        </Link>
      </div>
    </div>
  );
}
