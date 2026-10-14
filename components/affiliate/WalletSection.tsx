"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowDownToLine,
  Landmark,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import type { Withdrawal } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  balance: number;
  withdrawals: Withdrawal[];
  onWithdraw?: (amount: number, method: string) => Promise<boolean>;
}

const statusIcon = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

const statusColor = {
  PENDING: "text-amber-500 bg-amber-50",
  APPROVED: "text-success bg-green-50",
  REJECTED: "text-red-500 bg-red-50",
};

export default function WalletSection({ balance, withdrawals, onWithdraw }: Props) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Pindahan Bank");
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const amt = parseFloat(amount) || 0;
  const canWithdraw = amt >= 50 && amt <= balance;

  const submit = async () => {
    if (!canWithdraw) return;
    setError("");

    if (onWithdraw) {
      const ok = await onWithdraw(amt, method);
      if (!ok) {
        setError("Gagal hantar permintaan. Semak baki dan cuba lagi.");
        return;
      }
    }
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setAmount("");
      setError("");
    }, 1800);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Baki & tarik */}
      <div className="relative overflow-hidden rounded-3xl bg-secondary p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Wallet className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm text-gray-400">Baki Akaun</p>
              <p className="font-heading text-4xl font-extrabold text-white">
                {formatPrice(balance)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Minimum pengeluaran: RM50
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-light" />
              Proses dalam 1–3 hari bekerja
            </p>
          </div>

          <button onClick={() => setShowModal(true)} className="btn-primary mt-6 w-full">
            <ArrowDownToLine className="h-4 w-4" />
            Tarik Wang
          </button>
        </div>
      </div>

      {/* Sejarah */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft md:p-8">
        <h3 className="font-heading text-xl font-bold">Sejarah Pengeluaran</h3>
        <div className="mt-5 space-y-3">
          {withdrawals.length === 0 && (
            <p className="rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
              Belum ada pengeluaran.
            </p>
          )}
          {withdrawals.map((w) => {
            const Icon = statusIcon[w.status];
            return (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4"
              >
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", statusColor[w.status])}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-heading font-bold">{formatPrice(w.amount)}</p>
                  <p className="flex items-center gap-1.5 text-xs text-textsec">
                    <Landmark className="h-3 w-3" />
                    {w.method} • {formatDate(w.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    statusColor[w.status]
                  )}
                >
                  {w.status === "PENDING" ? "Sedang Diproses" : w.status === "APPROVED" ? "Diluluskan" : "Ditolak"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal tarik */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft-lg md:p-8"
            >
              <h3 className="font-heading text-xl font-bold">Tarik Wang</h3>
              <p className="mt-1 text-sm text-textsec">Baki tersedia: {formatPrice(balance)}</p>

              {submitted ? (
                <div className="mt-8 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
                  <p className="mt-3 font-heading text-lg font-bold">Permintaan dihantar!</p>
                  <p className="text-sm text-textsec">Diproses dalam 1–3 hari bekerja.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Jumlah (RM)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    />
                    {amt > 0 && !canWithdraw && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {amt < 50 ? "Minimum RM50." : "Melebihi baki."}
                      </p>
                    )}
                  </div>
                  {error && (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                      {error}
                    </p>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Kaedah</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    >
                      <option>Pindahan Bank</option>
                      <option>Touch 'n Go eWallet</option>
                      <option>GrabPay</option>
                    </select>
                  </div>
                  <button onClick={submit} disabled={!canWithdraw} className="btn-primary w-full">
                    Hantar Permintaan
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
