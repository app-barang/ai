"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  Wallet,
  Settings,
} from "lucide-react";
import WalletSection from "@/components/affiliate/WalletSection";
import { mockAffiliateStats, mockWithdrawals } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Withdrawal } from "@/types";

const menu = [
  { href: "/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/dashboard/link", label: "Link Afiliasi", icon: Link2 },
  { href: "/dashboard/promosi", label: "Promosi", icon: Megaphone },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: Settings },
];

export default function WalletPage() {
  const [active] = useState("/dashboard/wallet");
  const [balance, setBalance] = useState(mockAffiliateStats.balance);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);

  // Ambil data wallet sebenar (fallback ke data demo)
  useEffect(() => {
    fetch("/api/affiliate/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.balance === "number") setBalance(data.balance);
      })
      .catch(() => {});

    fetch("/api/affiliate/withdraw")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.withdrawals && Array.isArray(data.withdrawals) && data.withdrawals.length > 0) {
          setWithdrawals(data.withdrawals);
        }
      })
      .catch(() => {});
  }, []);

  // Hantar permintaan pengeluaran ke API
  const handleWithdraw = async (amount: number, method: string) => {
    try {
      const res = await fetch("/api/affiliate/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Gagal");
      }
      setBalance(data.newBalance);
      setWithdrawals((w) => [
        {
          id: data.withdrawal.id,
          affiliateId: "me",
          amount: data.withdrawal.amount,
          method: data.withdrawal.method,
          status: data.withdrawal.status,
          createdAt: data.withdrawal.createdAt,
        },
        ...w,
      ]);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-10">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24">
            <nav className="space-y-1">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    active === m.href
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-gray-600 hover:bg-bgalt"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
                <span className="text-gradient">Wallet</span> Afiliator
              </h1>
              <p className="mt-1 text-sm text-textsec">
                Urus pendapatan dan tarik wang anda.
              </p>
            </div>

            <WalletSection
              balance={balance}
              withdrawals={withdrawals}
              onWithdraw={handleWithdraw}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
