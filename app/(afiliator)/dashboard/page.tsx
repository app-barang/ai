"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  Wallet,
  Settings,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import CommissionCard from "@/components/affiliate/CommissionCard";
import { mockAffiliateStats, mockProducts } from "@/lib/mock-data";
import { formatPrice, formatNumber, getRadarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AffiliateStats } from "@/types";

const menu = [
  { href: "/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/dashboard/link", label: "Link Afiliasi", icon: Link2 },
  { href: "/dashboard/promosi", label: "Promosi", icon: Megaphone },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: Settings },
];

export default function DashboardPage() {
  const [active, setActive] = useState("/dashboard");
  const [stats, setStats] = useState<AffiliateStats | null>(null);

  // Ambil stats sebenar dari API (fallback ke data demo)
  useEffect(() => {
    fetch("/api/affiliate/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.totalClicks === "number") setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-10">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24">
            <div className="mb-4 flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                <TrendingUp className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-heading font-bold">Dashboard</p>
                <p className="text-xs text-textsec">Afiliator</p>
              </div>
            </div>
            <nav className="space-y-1">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setActive(m.href)}
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

            <div className="mt-4 rounded-2xl bg-bgalt p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Flame className="h-3.5 w-3.5" /> Tips Hari Ini
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Produk dengan skor radar 90+ ada kadar konversi 3x ganda.
                Promosi hari ini!
              </p>
            </div>
          </aside>

          {/* Kandungan */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
                  Ikhtisar <span className="text-gradient">Afiliasi</span>
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-textsec">
                  <Clock className="h-3.5 w-3.5" /> Dikemaskini 5 minit lepas
                </p>
              </div>
              <Link href="/dashboard/link" className="btn-primary !py-2.5 text-sm">
                Jana Link <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <CommissionCard stats={stats ?? mockAffiliateStats} />

            {/* Produk teratas */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
              <h2 className="font-heading text-lg font-bold">
                Produk Teratas Afiliator
              </h2>
              <div className="mt-4 divide-y divide-gray-50">
                {mockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-4 py-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold text-white"
                      style={{ backgroundColor: getRadarColor(p.radarScore) }}
                    >
                      {p.radarScore}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-heading text-sm font-bold">{p.name}</p>
                      <p className="text-xs text-textsec">
                        {formatNumber(p.sold)} terjual • {p.marketplace}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-sm font-bold text-success">
                        +{formatPrice(p.price * 0.35)}
                      </p>
                      <p className="text-xs text-textsec">komisen/jualan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
