"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Sparkles, TrendingUp, ShieldCheck, ChevronRight, PlayCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Glow dekoratif */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-viral-pink/20 blur-3xl" />

      <div className="container-custom relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        {/* Teks */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Dikurasi oleh Radar AI • Dikemaskini setiap jam
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
          >
            Viral?
            <br />
            <span className="text-gradient">Kami Semak Dulu.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-lg text-base leading-relaxed text-textsec md:text-lg"
          >
            BarangViral menyemak ribuan produk di TikTok, Shopee, Lazada dan
            Instagram. Kami tampilkan sahaja yang betul-betul viral, berkualiti
            dan berpotensi komisen afiliasi <strong className="text-primary">sehingga 50%</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link href="#produk" className="btn-primary">
              <Flame className="h-4 w-4" />
              Lihat Produk Viral
            </Link>
            <Link href="/radar" className="btn-outline">
              <TrendingUp className="h-4 w-4" />
              Cuba Radar AI
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-textsec"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" /> 100% Disemak
            </span>
            <span className="flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4 text-primary" /> 2,400+ produk dikurasi
            </span>
            <span className="flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 text-primary" /> Komisen 30–50%
            </span>
          </motion.div>
        </div>

        {/* Visual Radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="card-soft relative overflow-hidden !p-8">
            <div className="relative flex h-64 w-64 items-center justify-center">
              {/* Bulatan radar */}
              <div className="absolute inset-0 animate-pulse-soft rounded-full border-2 border-primary/30" />
              <div className="absolute inset-8 rounded-full border border-primary/20" />
              <div className="absolute inset-16 rounded-full border border-primary/10" />
              <div className="absolute inset-0 animate-radar-spin rounded-full [background:conic-gradient(from_0deg,rgba(255,107,0,0.35),transparent_70deg,transparent_360deg)]" />
              {/* Titik viral */}
              <span className="absolute left-1/2 top-1/3 h-3 w-3 animate-ping rounded-full bg-viral-pink" />
              <span className="absolute left-1/2 top-1/3 h-3 w-3 rounded-full bg-viral-pink shadow-glow" />
              <span className="absolute left-[30%] top-[60%] h-2.5 w-2.5 rounded-full bg-primary shadow-glow" />
              <span className="absolute left-[62%] top-[45%] h-2.5 w-2.5 rounded-full bg-success shadow" />
              {/* Label tengah */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-gradient-brand px-4 py-1.5 text-xs font-bold text-white shadow-glow">
                RADAR AI • LIVE
              </div>
            </div>
          </div>

          {/* Badge terapung */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -left-4 top-8 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-soft-lg"
          >
            <p className="text-xs text-textsec">Trending #1</p>
            <p className="font-heading text-sm font-bold">LED Face Mask</p>
            <p className="text-xs font-semibold text-success">+320% jualan</p>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -right-2 bottom-16 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-soft-lg"
          >
            <p className="text-xs text-textsec">Komisen</p>
            <p className="font-heading text-lg font-extrabold text-gradient">hingga 50%</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
