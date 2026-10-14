"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Flame } from "lucide-react";
import { mockTrends } from "@/lib/mock-data";
import { getRadarColor, getRadarLabel } from "@/lib/utils";

export default function TrendingSection() {
  const top = [...mockTrends].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <section className="container-custom py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Flame className="h-3.5 w-3.5" /> Trending Minggu Ini
          </span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
            Mula <span className="text-gradient">naik daun</span>
          </h2>
        </div>
        <Link href="/radar" className="btn-outline">
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {top.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-soft relative overflow-hidden"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: getRadarColor(t.score) }}
            />
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-bgalt px-2.5 py-1 text-xs font-bold text-textsec">
                {t.platform}
              </span>
              <TrendingUp
                className="h-4 w-4"
                style={{ color: getRadarColor(t.score) }}
              />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold">{t.keyword}</h3>
            <p className="mt-1 text-sm text-textsec">{t.category}</p>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p
                  className="font-heading text-3xl font-extrabold"
                  style={{ color: getRadarColor(t.score) }}
                >
                  {t.score}
                </p>
                <p className="text-xs text-textsec">skor radar</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-sm font-bold text-success">
                  +{t.growth}%
                </p>
                <p className="text-xs text-textsec">{getRadarLabel(t.score)}</p>
              </div>
            </div>

            {/* Bar mini */}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bgalt">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${t.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                className="h-full rounded-full"
                style={{ background: getRadarColor(t.score) }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
