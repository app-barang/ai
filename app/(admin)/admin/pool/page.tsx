"use client";

import { useEffect, useState } from "react";
import { Droplets, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Pool {
  id: string;
  type: string;
  period: string;
  totalFund: number;
  allocated: number;
  reserved: number;
  remaining: number;
  utilization: number;
  totalClicks: number;
  totalEarners: number;
  currentRate: number;
  status: string;
}

interface PoolData {
  period: string;
  pools: Pool[];
  currentMonth: { pools: number; totalFund: number; allocated: number; remaining: number };
  earnings: { type: string; count: number; total: number }[];
}

const typeLabel: Record<string, string> = {
  CLICK_POOL: "Click Pool",
  RENT_POOL: "Rent Pool",
  TEAM_POOL: "Team Pool",
};

export default function AdminPoolPage() {
  const [data, setData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/pool-status", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Gagal memuatkan status pool."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan pool...
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Status <span className="text-gradient">Pool</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">Periode {data.period}</p>
        </div>
        <button onClick={load} className="btn-outline !py-2.5 text-sm">
          <RefreshCw className="h-4 w-4" /> Muat Semula
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-soft">
          <p className="text-xs uppercase tracking-wider text-textsec">Jumlah dana</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">{formatPrice(data.currentMonth.totalFund)}</p>
        </div>
        <div className="card-soft">
          <p className="text-xs uppercase tracking-wider text-textsec">Telah diagih</p>
          <p className="mt-1 font-heading text-2xl font-extrabold text-primary">{formatPrice(data.currentMonth.allocated)}</p>
        </div>
        <div className="card-soft">
          <p className="text-xs uppercase tracking-wider text-textsec">Baki</p>
          <p className="mt-1 font-heading text-2xl font-extrabold text-success">{formatPrice(data.currentMonth.remaining)}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Droplets className="h-5 w-5 text-primary" /> Semua Pool
        </h2>
        {data.pools.length === 0 ? (
          <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">Tiada pool.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.pools.map((p) => (
              <div key={p.id} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {typeLabel[p.type] ?? p.type}{" "}
                      <span className="text-xs font-normal text-textsec">• {p.period}</span>
                    </p>
                    <p className="text-xs text-textsec">
                      {p.type === "CLICK_POOL" ? `Kadar RM${p.currentRate.toFixed(3)}/klik • ${p.totalClicks} klik` : `${p.totalEarners} penerima`}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                    {p.utilization}% digunakan
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bgalt">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, p.utilization)}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-textsec">
                  <span>Dana: {formatPrice(p.totalFund)}</span>
                  <span>Diagih: {formatPrice(p.allocated)}</span>
                  <span>Baki: {formatPrice(p.remaining)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold">Pendapatan Mengikut Jenis (Bulan Ini)</h2>
        {data.earnings.length === 0 ? (
          <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">Tiada pendapatan direkod.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.earnings.map((e) => (
              <div key={e.type} className="rounded-2xl bg-bgalt p-4">
                <p className="text-xs text-textsec">{e.type}</p>
                <p className="mt-1 font-heading text-lg font-extrabold">{formatPrice(e.total)}</p>
                <p className="text-xs text-textsec">{e.count} transaksi</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
