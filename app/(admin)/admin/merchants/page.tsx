"use client";

import { useCallback, useEffect, useState } from "react";
import { Store, Loader2, AlertCircle, Check, Ban, RefreshCw } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  phone: string;
  tier: string;
  status: string;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  user: { email: string; name: string | null };
  _count: { products: number };
}

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  PENDING: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-600",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default function AdminMerchantsPage() {
  const [items, setItems] = useState<Merchant[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = status ? `?status=${status}` : "";
      const r = await fetch(`/api/admin/merchants${qs}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setItems(d.merchants ?? []);
    } catch {
      setError("Gagal memuatkan merchant.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "suspend") => {
    setBusy(id);
    try {
      const r = await fetch("/api/admin/merchants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: id, action }),
      });
      if (r.ok) await load();
      else setError("Gagal mengemas kini merchant.");
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Urus <span className="text-gradient">Merchant</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">{items.length} merchant dipaparkan</p>
        </div>
        <button onClick={load} className="btn-outline !py-2.5 text-sm">
          <RefreshCw className="h-4 w-4" /> Muat Semula
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "PENDING", "ACTIVE", "SUSPENDED"].map((s) => (
          <button
            key={s || "ALL"}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white"
                : "rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-primary"
            }
          >
            {s ? (s === "PENDING" ? "Menunggu" : s === "ACTIVE" ? "Aktif" : "Digantung") : "Semua"}
          </button>
        ))}
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
          Tiada merchant.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-bgalt">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-textsec">
                  <th className="px-4 py-3">Bisnes</th>
                  <th className="px-4 py-3">Pemilik</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3 text-right">Produk</th>
                  <th className="px-4 py-3 text-right">Jualan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((m) => (
                  <tr key={m.id} className="hover:bg-bgalt/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{m.businessName}</p>
                      <p className="text-xs text-textsec">
                        {m.businessType === "sdn_bhd" ? "Sdn Bhd" : "Individu"} • {m.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{m.user.name ?? "-"}</p>
                      <p className="text-xs text-textsec">{m.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                        {m.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{m._count.products}</td>
                    <td className="px-4 py-3 text-right">
                      <p>{m.totalSales}</p>
                      <p className="text-xs text-textsec">{formatPrice(m.totalRevenue)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[m.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {m.status === "PENDING" ? "Menunggu" : m.status === "ACTIVE" ? "Aktif" : m.status === "SUSPENDED" ? "Digantung" : m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {m.status !== "ACTIVE" && (
                          <button
                            onClick={() => act(m.id, "approve")}
                            disabled={busy === m.id}
                            className="flex h-8 items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 text-[11px] font-bold text-success hover:bg-green-100"
                          >
                            <Check className="h-3.5 w-3.5" /> Lulus
                          </button>
                        )}
                        {m.status !== "SUSPENDED" && (
                          <button
                            onClick={() => act(m.id, "suspend")}
                            disabled={busy === m.id}
                            className="flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
                          >
                            <Ban className="h-3.5 w-3.5" /> Gantung
                          </button>
                        )}
                      </div>
                    </td>
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
