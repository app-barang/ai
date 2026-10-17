"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FraudLog {
  id: string;
  affiliateId: string | null;
  merchantId: string | null;
  type: string;
  severity: string;
  details: unknown;
  ipAddress: string | null;
  action: string;
  createdAt: string;
}

const severityStyle: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-600",
};

export default function AdminFraudPage() {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = severity ? `?severity=${severity}` : "";
      const r = await fetch(`/api/admin/fraud${qs}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setLogs(d.logs ?? []);
    } catch {
      setError("Gagal memuatkan log fraud.");
    } finally {
      setLoading(false);
    }
  }, [severity]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Log <span className="text-gradient">Anti-Fraud</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">{logs.length} rekod</p>
        </div>
        <button onClick={load} className="btn-outline !py-2.5 text-sm">
          <RefreshCw className="h-4 w-4" /> Muat Semula
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "HIGH", "MEDIUM", "LOW"].map((s) => (
          <button
            key={s || "ALL"}
            onClick={() => setSeverity(s)}
            className={
              severity === s
                ? "rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white"
                : "rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-primary"
            }
          >
            {s || "Semua"}
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
      ) : logs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-textsec" />
          <p className="mt-3 font-semibold">Tiada log fraud</p>
          <p className="text-sm text-textsec">Bagus — tiada aktiviti mencurigakan.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-bgalt">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-textsec">
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Keterukan</th>
                  <th className="px-4 py-3">Tindakan</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Butiran</th>
                  <th className="px-4 py-3 text-right">Tarikh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-bgalt/50">
                    <td className="px-4 py-3 font-semibold">{l.type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${severityStyle[l.severity] ?? "bg-gray-100 text-gray-500"}`}>
                        {l.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{l.action}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.ipAddress ?? "-"}</td>
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate text-xs text-textsec">
                        {JSON.stringify(l.details)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-textsec">
                      {formatDate(l.createdAt)}
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
