"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Affiliate {
  id: string;
  username: string;
  tier: string;
  status: string;
  totalClicks: number;
  totalSales: number;
  totalEarnings: number;
  balance: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  kycVerified: boolean;
  user: { email: string; name: string | null };
}

const tierStyle: Record<string, string> = {
  BRONZE: "bg-amber-100 text-amber-700",
  SILVER: "bg-gray-200 text-gray-700",
  GOLD: "bg-yellow-100 text-yellow-700",
  DIAMOND: "bg-cyan-100 text-cyan-700",
  ELITE: "bg-purple-100 text-purple-700",
};

export default function AdminAffiliatesPage() {
  const [items, setItems] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/affiliates?limit=50", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setItems(d.affiliates ?? []))
      .catch(() => setError("Gagal memuatkan afiliator."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Urus <span className="text-gradient">Afiliator</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">{items.length} afiliator</p>
        </div>
        <button onClick={load} className="btn-outline !py-2.5 text-sm">
          <RefreshCw className="h-4 w-4" /> Muat Semula
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-soft">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-textsec">
          Tiada afiliator.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-bgalt">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-textsec">
                  <th className="px-4 py-3">Afiliator</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3 text-center">Level Team</th>
                  <th className="px-4 py-3 text-right">Klik</th>
                  <th className="px-4 py-3 text-right">Jualan</th>
                  <th className="px-4 py-3 text-right">Pendapatan</th>
                  <th className="px-4 py-3 text-right">Baki</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-bgalt/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">@{a.username}</p>
                      <p className="text-xs text-textsec">{a.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tierStyle[a.tier] ?? "bg-gray-100 text-gray-500"}`}>
                        {a.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      L1 {a.level1Count} • L2 {a.level2Count} • L3 {a.level3Count}
                    </td>
                    <td className="px-4 py-3 text-right">{a.totalClicks}</td>
                    <td className="px-4 py-3 text-right">{a.totalSales}</td>
                    <td className="px-4 py-3 text-right font-semibold text-success">
                      {formatPrice(a.totalEarnings)}
                    </td>
                    <td className="px-4 py-3 text-right">{formatPrice(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
