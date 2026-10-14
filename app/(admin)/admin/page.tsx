"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Flame,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  BarChart3,
} from "lucide-react";
import { mockProducts, mockTrends } from "@/lib/mock-data";
import { formatNumber, formatPrice, getRadarColor } from "@/lib/utils";

export default function AdminPage() {
  const stats = [
    { icon: Users, label: "Jumlah Pengguna", value: "8,245", delta: "+12%", color: "#FF6B00" },
    { icon: Package, label: "Produk Aktif", value: "2,400", delta: "+48 minggu ini", color: "#FF007A" },
    { icon: TrendingUp, label: "Afiliator", value: "3,210", delta: "+8%", color: "#00C853" },
    { icon: DollarSign, label: "Komisen Dibayar", value: "RM 45.8k", delta: "+22%", color: "#7C3AED" },
  ];

  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-10">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Panel Pentadbir
            </span>
            <h1 className="mt-3 font-heading text-2xl font-extrabold md:text-3xl">
              Admin <span className="text-gradient">BarangViral</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-textsec">
            <Activity className="h-4 w-4 text-success" />
            Semua sistem beroperasi
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-soft"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${s.color}18`, color: s.color }}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-heading text-2xl font-extrabold">{s.value}</p>
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="mt-1 text-xs font-semibold text-success">{s.delta}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Produk perlu semak */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <Flame className="h-5 w-5 text-primary" /> Produk Viral Terbaru
            </h2>
            <div className="mt-4 space-y-3">
              {mockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-50 p-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold text-white"
                    style={{ backgroundColor: getRadarColor(p.radarScore) }}
                  >
                    {p.radarScore}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-textsec">
                      {p.category} • {formatNumber(p.sold)} terjual
                    </p>
                  </div>
                  <span className="font-heading text-sm font-bold">{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trend */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <BarChart3 className="h-5 w-5 text-viral-pink" /> Trend Radar (Langsung)
            </h2>
            <div className="mt-4 space-y-3">
              {mockTrends.slice(0, 5).map((t) => (
                <div key={t.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{t.keyword}</span>
                    <span className="text-xs text-textsec">{t.platform}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bgalt">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${t.score}%`, backgroundColor: getRadarColor(t.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pantauan */}
        <div className="mt-6 rounded-3xl bg-secondary p-6 md:p-8">
          <h2 className="font-heading text-lg font-bold text-white">
            Pantauan Sistem
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Imbasan Radar", status: "Berjalan", ok: true },
              { label: "Chatbot AI", status: "Berjalan", ok: true },
              { label: "Pembayaran", status: "Berjalan", ok: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-gray-300">{s.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
