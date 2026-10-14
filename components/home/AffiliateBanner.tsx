"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Percent, Wallet, MousePointerClick, Bot, ArrowRight } from "lucide-react";

export default function AffiliateBanner() {
  return (
    <section className="container-custom py-14">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-viral-pink p-8 md:p-14"
      >
        {/* Hiasan corak */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-5 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <Percent className="h-3.5 w-3.5" /> Program Afiliasi
            </span>
            <h2 className="font-heading text-3xl font-extrabold leading-tight md:text-5xl">
              Janji duit sambil
              <br />
              <span className="drop-shadow-lg">scrolling TikTok.</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/90 md:text-base">
              Kongsikan link produk viral kami. Setiap jualan melalui
              link anda beri komisen <strong>30% hingga 50%</strong>.
              Tiada modal, tiada stok, tiada penghantaran.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/daftar" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-heading font-bold text-primary shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                Daftar Percuma <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/afiliator"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 font-heading font-bold text-white transition-all duration-300 hover:bg-white/10"
              >
                Pelajari Lagi
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Percent, value: "50%", label: "Komisen maksimum" },
              { icon: MousePointerClick, value: "12.4k", label: "Klik harian afiliator" },
              { icon: Wallet, value: "RM 2.8k", label: "Purata pendapatan bulanan" },
              { icon: Bot, value: "24/7", label: "Sokongan AI afiliator" },
            ].map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.04 }}
                className="rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-md"
              >
                <s.icon className="h-6 w-6 text-white/90" />
                <p className="mt-3 font-heading text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs text-white/80">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
