"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Radar,
  TrendingUp,
  ShieldCheck,
  Bot,
  Percent,
} from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Kurasi Viral Harian",
    desc: "Produk disemak manual + AI. Hanya yang betul-betul trending yang dipaparkan.",
    color: "#FF6B00",
  },
  {
    icon: Radar,
    title: "Radar AI Real-Time",
    desc: "Imbasan trend TikTok, Shopee, Lazada & Instagram setiap jam tanpa anda perlu cari sendiri.",
    color: "#FF007A",
  },
  {
    icon: Percent,
    title: "Komisen Sehingga 50%",
    desc: "Kadar komisen tertinggi pasaran. Jual lebih, untung lebih — dibayar tepat pada masanya.",
    color: "#00C853",
  },
  {
    icon: Bot,
    title: "Chatbot AI 24/7",
    desc: "Vira menjawab soalan produk, bantu jana caption, dan bimbing strategi promosi anda.",
    color: "#7C3AED",
  },
  {
    icon: TrendingUp,
    title: "Analisis Prestasi",
    desc: "Klik, konversi dan pendapatan dikesan real-time dalam dashboard afiliator.",
    color: "#FFB300",
  },
  {
    icon: ShieldCheck,
    title: "Produk Terverifikasi",
    desc: "Setiap produk disemak kualiti, penghantaran dan ulasan sebelum disenaraikan.",
    color: "#00C853",
  },
];

export default function WhyUsSection() {
  return (
    <section className="bg-bgalt py-16 md:py-24">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            Kenapa BarangViral?
          </span>
          <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
            Bukan sekadar jualan. <span className="text-gradient">Ia sistem viral.</span>
          </h2>
          <p className="mt-3 text-textsec">
            Enam pilar yang menjadikan BarangViral platform afiliasi paling
            dipercayai di Malaysia.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="card-soft group"
            >
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${f.color}18`, color: f.color }}
              >
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="font-heading text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-textsec">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
