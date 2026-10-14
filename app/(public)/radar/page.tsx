"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radar, RefreshCw, Flame, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import type { TrendItem } from "@/types";
import { mockTrends } from "@/lib/mock-data";
import { getRadarColor, getRadarLabel, formatNumber } from "@/lib/utils";

const platforms = ["Semua", "TikTok", "Shopee", "Lazada", "Instagram"];

export default function RadarPage() {
  const [trends, setTrends] = useState<TrendItem[]>(mockTrends);
  const [platform, setPlatform] = useState("Semua");
  const [scanning, setScanning] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [lastScan, setLastScan] = useState(new Date());

  const filtered =
    platform === "Semua" ? trends : trends.filter((t) => t.platform === platform);

  const scan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/radar", { method: "POST" });
      const data = await res.json();
      setAnalysis(data.analysis ?? "");
    } catch {
      setAnalysis("");
    }
    // Simulasi pergerakan skor
    setTrends((prev) =>
      [...prev]
        .map((t) => ({
          ...t,
          score: Math.min(99, Math.max(40, t.score + Math.round((Math.random() - 0.5) * 8))),
          mentions: t.mentions + Math.round(Math.random() * 500),
        }))
        .sort((a, b) => b.score - a.score)
    );
    setLastScan(new Date());
    setTimeout(() => setScanning(false), 1200);
  };

  useEffect(() => {
    const t = setInterval(scan, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Radar className="h-3.5 w-3.5" /> Imbasan AI Real-Time
            </span>
            <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-5xl">
              Radar <span className="text-gradient">AI</span>
            </h1>
            <p className="mt-2 max-w-xl text-textsec">
              Imbasan trend produk di 4 platform. Dikemaskini setiap jam —
              <span className="font-semibold text-secondary">
                {" "}akhir imbasan: {lastScan.toLocaleTimeString("ms-MY")}
              </span>
            </p>
          </div>
          <button onClick={scan} disabled={scanning} className="btn-primary">
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? "Mengimbas..." : "Imbas Semula"}
          </button>
        </div>

        {/* Analisis AI */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-orange-50 to-pink-50 p-5"
          >
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
              <Sparkles className="h-4 w-4" /> Analisis Radar AI
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{analysis}</p>
          </motion.div>
        )}

        {/* Filter platform */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={
                platform === p
                  ? "shrink-0 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow"
                  : "shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-primary"
              }
            >
              {p}
            </button>
          ))}
        </div>

        {/* Grid trend */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card-soft relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: getRadarColor(t.score) }} />
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-lg bg-bgalt px-2.5 py-1 text-xs font-bold text-textsec">
                    {t.platform}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-bold">{t.keyword}</h3>
                  <p className="text-sm text-textsec">{t.category}</p>
                </div>
                {t.score >= 85 && (
                  <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    <Flame className="h-3 w-3" /> HOT
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="font-heading text-4xl font-extrabold" style={{ color: getRadarColor(t.score) }}>
                    {t.score}
                  </p>
                  <p className="text-xs text-textsec">Skor Radar</p>
                </div>
                <div className="text-right text-sm">
                  <p className="flex items-center justify-end gap-1 font-bold text-success">
                    <TrendingUp className="h-4 w-4" /> +{t.growth}%
                  </p>
                  <p className="text-xs text-textsec">{formatNumber(t.mentions)} sebutan</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-bgalt">
                <motion.div
                  animate={{ width: `${t.score}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: getRadarColor(t.score) }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold" style={{ color: getRadarColor(t.score) }}>
                {getRadarLabel(t.score)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl bg-secondary p-8 text-center md:p-12">
          <h2 className="font-heading text-2xl font-extrabold text-white md:text-3xl">
            Dapatkan alert trend <span className="text-gradient">sebelum viral</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Daftar sebagai afiliator dan terima notifikasi trend panas harian
            terus ke Telegram anda.
          </p>
          <a href="/daftar" className="btn-primary mt-6 inline-flex">
            <Sparkles className="h-4 w-4" /> Daftar Afiliator Percuma
          </a>
        </div>
      </div>
    </div>
  );
}
