"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Radar, TrendingUp, Flame, RefreshCw } from "lucide-react";
import { mockTrends } from "@/lib/mock-data";
import { getRadarColor, getRadarLabel } from "@/lib/utils";

export default function RadarWidget() {
  const [trends, setTrends] = useState(mockTrends.slice(0, 5));
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(new Date());

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setTrends((prev) => [...prev].sort(() => Math.random() - 0.5).slice(0, 5));
      setLastScan(new Date());
      setScanning(false);
    }, 1500);
  };

  useEffect(() => {
    const t = setInterval(scan, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="container-custom py-10">
      <div className="relative overflow-hidden rounded-3xl bg-secondary p-6 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-viral-pink/20 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          {/* Kiri */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
                <Radar className={`h-6 w-6 text-white ${scanning ? "animate-spin" : ""}`} />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
                  Radar <span className="text-gradient">AI</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Imbasan terakhir: {lastScan.toLocaleTimeString("ms-MY")}
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-300 md:text-base">
              AI kami mengimbas 4 platform serentak setiap jam — mendeteksi
              produk yang mula viral <em>sebelum</em> habis dijual.
            </p>
            <div className="flex flex-wrap gap-2">
              {["TikTok", "Shopee", "Lazada", "Instagram"].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                >
                  {p}
                </span>
              ))}
            </div>
            <button onClick={scan} disabled={scanning} className="btn-primary">
              <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Mengimbas..." : "Imbas Sekarang"}
            </button>
            <Link
              href="/radar"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-light hover:underline"
            >
              Buka Radar penuh <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          {/* Kanan - senarai trend */}
          <div className="space-y-2">
            {trends.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg font-heading text-xs font-bold"
                    style={{ backgroundColor: `${getRadarColor(t.score)}22`, color: getRadarColor(t.score) }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      {t.keyword}
                      {t.score >= 85 && <Flame className="h-3.5 w-3.5 text-primary" />}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.platform} • {t.category} • {t.mentions.toLocaleString()} sebutan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm font-bold" style={{ color: getRadarColor(t.score) }}>
                    {t.score}
                  </p>
                  <p className="text-[10px] font-semibold text-success">+{t.growth}%</p>
                  <p className="text-[10px] text-gray-400">{getRadarLabel(t.score)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
