"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  Loader2,
  AlertCircle,
  Check,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  XCircle,
  Landmark,
  Info,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: string;
  requestedAt: string;
  notes: string | null;
}

interface Stats {
  affiliate: { balance: number; pendingBalance: number; totalEarnings: number } | null;
}

interface Breakdown {
  formulas: Record<
    string,
    { label: string; split: number[]; example: string[]; cap: string | null; rateLabel: string }
  >;
}

const statusIcon: Record<string, React.ElementType> = {
  PENDING: Clock,
  PROCESSING: Clock,
  COMPLETED: CheckCircle2,
  REJECTED: XCircle,
};

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-success",
  REJECTED: "bg-red-100 text-red-600",
};

export default function AffiliateWalletPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [accountInfo, setAccountInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [sRes, pRes, bRes] = await Promise.all([
        fetch("/api/affiliate/stats", { cache: "no-store" }),
        fetch("/api/affiliate/payout", { cache: "no-store" }),
        fetch("/api/affiliate/earnings/breakdown", { cache: "no-store" }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (pRes.ok) {
        const d = await pRes.json();
        setPayouts(d.payouts ?? []);
      }
      if (bRes.ok) setBreakdown(await bRes.json());
    } catch {
      setError("Gagal memuatkan wallet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const amt = Number(amount);
    if (!amt || amt < 50) {
      setError("Minimum pengeluaran RM50.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/affiliate/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, method, accountInfo }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Gagal membuat permintaan.");
        return;
      }
      setMessage(`Permintaan ${formatPrice(amt)} dihantar.`);
      setAmount("");
      setAccountInfo("");
      await load();
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan wallet...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          <span className="text-gradient">Wallet</span> Afiliator
        </h1>
        <p className="mt-1 text-sm text-textsec">Urus pendapatan dan pengeluaran anda.</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Baki + borang */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-secondary p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand">
                <Wallet className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-sm text-gray-400">Baki boleh keluar</p>
                <p className="font-heading text-3xl font-extrabold text-white">
                  {formatPrice(stats?.affiliate?.balance ?? 0)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-gray-400">Pending</p>
                <p className="font-bold text-white">
                  {formatPrice(stats?.affiliate?.pendingBalance ?? 0)}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-gray-400">Jumlah pendapatan</p>
                <p className="font-bold text-white">
                  {formatPrice(stats?.affiliate?.totalEarnings ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <ArrowDownToLine className="h-5 w-5 text-primary" /> Tarik Wang
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Jumlah (RM)</label>
                <input
                  type="number"
                  min={50}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-textsec">Minimum RM50 • diproses 1–3 hari bekerja</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Kaedah</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="bank">Pindahan Bank</option>
                  <option value="tng">Touch 'n Go eWallet</option>
                  <option value="grabpay">GrabPay</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Maklumat Akaun</label>
                <input
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  placeholder="Maybank 1234567890 / 01X-XXXXXXX"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                {busy ? "Menghantar..." : "Hantar Permintaan"}
              </button>
            </div>
          </form>
        </div>

        {/* Sejarah + formula */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
            <h2 className="font-heading text-lg font-bold">Sejarah Pengeluaran</h2>
            {payouts.length === 0 ? (
              <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
                Belum ada pengeluaran.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {payouts.map((p) => {
                  const Icon = statusIcon[p.status] ?? Clock;
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${statusColor[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{formatPrice(p.amount)}</p>
                        <p className="flex items-center gap-1 text-xs text-textsec">
                          <Landmark className="h-3 w-3" /> {p.method} • {formatDate(p.requestedAt)}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusColor[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {p.status === "PENDING" ? "Diproses" : p.status === "COMPLETED" ? "Selesai" : p.status === "REJECTED" ? "Ditolak" : p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {breakdown?.formulas && (
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <Info className="h-5 w-5 text-primary" /> Rumus Bonus
              </h2>
              <div className="mt-4 space-y-4 text-xs">
                {["CLICK_REWARD", "RENT_REWARD", "SALE_COMMISSION", "TEAM_BONUS"].map((k) => {
                  const f = breakdown.formulas[k];
                  if (!f) return null;
                  return (
                    <div key={k}>
                      <p className="font-bold text-secondary">
                        {f.label} <span className="font-normal text-textsec">• {f.rateLabel}</span>
                      </p>
                      <ul className="mt-1 space-y-0.5 text-gray-600">
                        {f.example.map((e, i) => (
                          <li key={i}>• {e}</li>
                        ))}
                      </ul>
                      {f.cap && <p className="mt-0.5 text-primary">Cap: {f.cap}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
