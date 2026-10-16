"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Radar,
  RefreshCw,
  Sparkles,
  Link2,
  Flame,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface TrendingItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  platform: string;
  viralScore: number;
  viralTrend: string;
  mentions: number;
  lastAnalyzed: string | null;
}

const trendMeta: Record<string, { label: string; classes: string; icon: string }> = {
  rising: { label: "Naik", classes: "bg-success/10 text-success", icon: "▲" },
  stable: { label: "Stabil", classes: "bg-gray-500/10 text-gray-300", icon: "●" },
  falling: { label: "Turun", classes: "bg-red-500/10 text-red-400", icon: "▼" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "belum dianalisis";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "baru sahaja";
  if (mins < 60) return `${mins} minit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default function RadarPage() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/radar", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuatkan radar");
      const data = await res.json();
      setTrending(Array.isArray(data.trending) ? data.trending : []);
      setAnalysis(data.analysis ?? "");
      setUpdatedAt(data.updatedAt ?? null);
    } catch {
      setError("Tidak dapat memuatkan data radar. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 60000); // auto-refresh 60s
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  const analyzeNow = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/radar/analyze", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error ?? "Analisis gagal");
      await load();
    } catch {
      setError("Analisis gagal dimulakan. Sila cuba lagi.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-8 md:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-light">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              LIVE
            </span>
            <h1 className="mt-3 font-heading text-3xl font-extrabold text-white md:text-5xl">
              Radar AI <span className="text-gradient">— Trend Live</span>
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              Update terakhir: {updatedAt ? timeAgo(updatedAt) : "—"}
            </p>
          </div>
          <button onClick={analyzeNow} disabled={analyzing || loading} className="btn-primary">
            <RefreshCw className={cn("h-4 w-4", analyzing && "animate-spin")} />
            {analyzing ? "Menganalisis..." : "Analisis Sekarang"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        {/* Analysis box */}
        <div className="mt-6 rounded-2xl bg-gradient-brand p-[2px]">
          <div className="rounded-2xl bg-secondary p-5 md:p-6">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-light">
              <Sparkles className="h-4 w-4" /> Analisis AI Groq
            </p>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
            ) : (
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-200 md:text-base">
                {analysis || "Tiada analisis buat masa ini."}
              </p>
            )}
          </div>
        </div>

        {/* Senarai produk */}
        <div className="mt-8 space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-white/10" />
                </div>
              ))
            : trending.map((t, i) => {
                const meta = trendMeta[t.viralTrend] ?? trendMeta.stable;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:bg-white/10 md:p-5"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Rank */}
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-heading text-base font-extrabold text-white",
                          i < 3 ? "bg-gradient-brand shadow-glow" : "bg-white/10"
                        )}
                      >
                        {i + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-sm font-bold text-white md:text-base">
                            {t.name}
                          </h3>
                          {t.viralScore >= 85 && (
                            <span className="flex items-center gap-1 rounded-lg bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary-light">
                              <Flame className="h-3 w-3" /> HOT
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {t.platform} • {t.category} • {formatNumber(t.mentions)} terjual
                        </p>

                        {/* Skor bar */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${t.viralScore}%` }}
                              transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                              className="h-full rounded-full bg-gradient-brand"
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right font-heading text-sm font-extrabold text-white">
                            {t.viralScore}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                              meta.classes
                            )}
                          >
                            <span>{meta.icon}</span> {meta.label}
                          </span>
                          <Link
                            href="/dashboard/link"
                            className="inline-flex items-center gap-1 rounded-xl border border-primary/40 px-3 py-1.5 text-xs font-bold text-primary-light transition-all hover:bg-primary hover:text-white"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Buat Link
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {!loading && trending.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/20 p-12 text-center text-gray-400">
            Tiada produk viral buat masa ini. Klik “Analisis Sekarang” untuk imbasan baharu.
          </div>
        )}
      </div>
    </div>
  );
}
