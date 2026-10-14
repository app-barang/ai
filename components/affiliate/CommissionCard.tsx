"use client";

import { motion } from "framer-motion";
import { MousePointerClick, ShoppingCart, Wallet, TrendingUp } from "lucide-react";
import type { AffiliateStats } from "@/types";
import { formatNumber, formatPrice, formatPercent } from "@/lib/utils";

interface Props {
  stats: AffiliateStats;
}

export default function CommissionCard({ stats }: Props) {
  const cards = [
    {
      icon: MousePointerClick,
      label: "Jumlah Klik",
      value: formatNumber(stats.totalClicks),
      sub: "Semua link afiliasi",
      color: "#FF6B00",
    },
    {
      icon: ShoppingCart,
      label: "Konversi",
      value: formatNumber(stats.totalConversions),
      sub: `${formatPercent(stats.conversionRate)} kadar konversi`,
      color: "#FF007A",
    },
    {
      icon: TrendingUp,
      label: "Jumlah Pendapatan",
      value: formatPrice(stats.totalEarnings),
      sub: `Kadar komisen ${formatPercent(stats.commissionRate)}`,
      color: "#00C853",
    },
    {
      icon: Wallet,
      label: "Baki Boleh Ditarik",
      value: formatPrice(stats.balance),
      sub: "Minimum RM50 untuk tarik",
      color: "#7C3AED",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="card-soft relative overflow-hidden"
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: c.color }}
          />
          <div className="flex items-start justify-between">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${c.color}18`, color: c.color }}
            >
              <c.icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 font-heading text-2xl font-extrabold md:text-3xl">{c.value}</p>
          <p className="mt-1 text-sm font-semibold">{c.label}</p>
          <p className="text-xs text-textsec">{c.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
