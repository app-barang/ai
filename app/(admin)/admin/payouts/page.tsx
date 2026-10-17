"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, Loader2, AlertCircle, Check, X, RefreshCw } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Payout {
  id: string;
  amount: number;
  method: string;
  accountInfo: string;
  status: string;
  requestedAt: string;
  notes: string | null;
  affiliate: { id: string; username: string; balance: number; pendingBalance: number };
}

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-success",
  REJECTED: "bg-red-100 text-red-600",
};

export default function AdminPayoutsPage() {
  const [items, setItems] = useState<Payout[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = status ? `?status=${status}` : "";
      const r = await fetch(`/api/admin/payouts${qs}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setItems(d.payouts ?? []);
    } catch {
      setError("Gagal memuatkan payout.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      const r = await fetch("/api/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: id, action }),
      });
      const d = await r.json();
      if (r.ok) await load();
      else setError(d.error ?? "Gagal memproses payout.");
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
            Urus <span className="text-gradient">Payout</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">Lulus atau tolak permintaan pengeluaran afiliator.</p>
        </div>
        <button onClick={load} className="btn-outline !py-2.5 text-sm">
          <RefreshCw className="h-4 w-4" /> Muat Semula
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["PENDING", "COMPLETED", "REJECTED", ""].map((s) => (
          <button
            key={s || "ALL"}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white"
                : "rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-primary"
            }
          >
            {s === "PENDING" ? "Menunggu" : s === "COMPLETED" ? "Selesai" : s === "REJECTED" ? "Ditolak" : "Semua"}
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
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Banknote className="mx-auto h-10 w-10 text-textsec" />
          <p className="mt-3 font-semibold">Tiada payout</p>
          <p className="text-sm text-textsec">Permintaan pengeluaran akan muncul di sini.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-bgalt">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-textsec">
                  <th className="px-4 py-3">Afiliator</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3">Kaedah</th>
                  <th className="px-4 py-3">Akaun</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Tarikh</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-bgalt/50">
                    <td className="px-4 py-3 font-semibold">@{p.affiliate.username}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 capitalize">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-textsec">{p.accountInfo}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {p.status === "PENDING" ? "Menunggu" : p.status === "COMPLETED" ? "Selesai" : p.status === "REJECTED" ? "Ditolak" : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-textsec">
                      {formatDate(p.requestedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {(p.status === "PENDING" || p.status === "PROCESSING") && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => act(p.id, "approve")}
                            disabled={busy === p.id}
                            className="flex h-8 items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 text-[11px] font-bold text-success hover:bg-green-100"
                          >
                            <Check className="h-3.5 w-3.5" /> Lulus
                          </button>
                          <button
                            onClick={() => act(p.id, "reject")}
                            disabled={busy === p.id}
                            className="flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
                          >
                            <X className="h-3.5 w-3.5" /> Tolak
                          </button>
                        </div>
                      )}
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
