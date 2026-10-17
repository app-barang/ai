"use client";

import { useEffect, useState } from "react";
import { MousePointerClick, Loader2, AlertCircle, Users, TrendingUp } from "lucide-react";

interface Stats {
  clicks: number;
  sales: number;
  conversion: number;
  thisMonth: { period: string; clicks: number; sales: number; conversion: number };
  lastMonth: { period: string; clicks: number; sales: number; conversion: number };
  topAffiliates: { affiliateId: string; username: string; tier: string; clicks: number }[];
}

export default function MerchantClicksPage() {
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
      .catch(() => setError("Gagal memuatkan data klik."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan...
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
    stats.lastMonth.clicks > 0
      ? Math.round(((stats.thisMonth.clicks - stats.lastMonth.clicks) / stats.lastMonth.clicks) * 100)
      : stats.thisMonth.clicks > 0
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          Statistik <span className="text-gradient">Klik</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">
          Prestasi trafik afiliator ke produk anda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-soft">
          <MousePointerClick className="h-6 w-6 text-primary" />
          <p className="mt-3 font-heading text-3xl font-extrabold">{stats.clicks.toLocaleString()}</p>
          <p className="text-sm font-semibold">Jumlah Klik</p>
          <p className="text-xs text-textsec">sepanjang masa</p>
        </div>
        <div className="card-soft">
          <TrendingUp className={`h-6 w-6 ${growth >= 0 ? "text-success" : "text-red-500"}`} />
          <p className="mt-3 font-heading text-3xl font-extrabold">
            {growth > 0 ? "+" : ""}
            {growth}%
          </p>
          <p className="text-sm font-semibold">Pertumbuhan</p>
          <p className="text-xs text-textsec">
            {stats.thisMonth.clicks} bulan ini vs {stats.lastMonth.clicks} lepas
          </p>
        </div>
        <div className="card-soft">
          <Users className="h-6 w-6 text-viral-pink" />
          <p className="mt-3 font-heading text-3xl font-extrabold">{stats.topAffiliates.length}</p>
          <p className="text-sm font-semibold">Afiliator Aktif</p>
          <p className="text-xs text-textsec">top 5 dipaparkan</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold">Afiliator Paling Aktif</h2>
        {stats.topAffiliates.length === 0 ? (
          <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
            Belum ada klik direkodkan.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {stats.topAffiliates.map((a, i) => {
              const max = Math.max(...stats.topAffiliates.map((x) => x.clicks), 1);
              return (
                <div key={a.affiliateId} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-semibold">@{a.username}</span>
                      <span className="font-bold">{a.clicks} klik</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-bgalt">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: `${(a.clicks / max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
