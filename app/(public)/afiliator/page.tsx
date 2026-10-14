"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Percent,
  MousePointerClick,
  Bot,
  ArrowRight,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    title: "1. Daftar & Pilih Produk",
    desc: "Daftar percuma, pilih produk viral dari katalog kami yang disemak Radar AI.",
  },
  {
    icon: MousePointerClick,
    title: "2. Kongsi Link Afiliasi",
    desc: "Jana link unik dan kongsi di TikTok, Instagram, Shopee atau Telegram.",
  },
  {
    icon: Percent,
    title: "3. Dapat Komisen 30–50%",
    desc: "Setiap jualan melalui link anda beri komisen automatik — dikesan real-time.",
  },
  {
    icon: TrendingUp,
    title: "4. Tarik Wang",
    desc: "Tarik pendapatan ke bank atau e-wallet. Minimum RM50, proses 1–3 hari.",
  },
];

const faqs = [
  {
    q: "Berapa komisen yang saya dapat?",
    a: "Afiliator baru bermula pada 30%. Kadar naik mengikut prestasi jualan, sehingga maksimum 50% untuk afiliator top.",
  },
  {
    q: "Perlukan modal atau stok?",
    a: "Tiada. Anda hanya berkongsi link. Kami uruskan stok, penghantaran dan khidmat pelanggan.",
  },
  {
    q: "Bila saya dibayar?",
    a: "Pengeluaran diproses setiap minggu. Minimum RM50, dibayar melalui pindahan bank atau e-wallet dalam 1–3 hari bekerja.",
  },
  {
    q: "Ada sokongan?",
    a: "Ya! Chatbot AI Aiden sedia 24/7 untuk bantu jana caption, analisis link dan strategi promosi.",
  },
];

export default function AfiliatorPage() {
  return (
    <div className="bg-bgalt py-12 md:py-20">
      <div className="container-custom">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Program Afiliasi
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold md:text-6xl">
            Janji duit sambil
            <br />
            <span className="text-gradient">buat content.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-textsec">
            Kongsikan produk viral kami dan dapat komisen <strong className="text-success">sehingga 50%</strong>
            setiap jualan. Tiada modal, tiada stok, tiada penghantaran.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/daftar" className="btn-primary">
              Daftar Percuma <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/masuk" className="btn-outline">
              Masuk Afiliator
            </Link>
          </div>
        </div>

        {/* Langkah */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-heading font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-textsec">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Keistimewaan */}
        <div className="mt-16 rounded-3xl bg-secondary p-8 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-white md:text-3xl">
                Kenapa afiliator pilih <span className="text-gradient">BarangViral?</span>
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  "Komisen tertinggi pasaran: 30% – 50%",
                  "Produk disemak Radar AI — tren sahaja",
                  "Pengesan klik & konversi real-time",
                  "Pembayaran mingguan, tiada minimum tunggu lama",
                  "Chatbot AI bantu jana caption & strategi",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: "50%", l: "Komisen maks" },
                { v: "RM 2.8k", l: "Purata bulanan" },
                { v: "3,200+", l: "Afiliator aktif" },
                { v: "98%", l: "Kepuasan" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="font-heading text-2xl font-extrabold text-gradient">{s.v}</p>
                  <p className="mt-1 text-xs text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center font-heading text-3xl font-extrabold">
            Soalan <span className="text-gradient">Lazim</span>
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <div key={f.q} className="card-soft">
                <p className="font-heading font-bold">{f.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-textsec">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bot */}
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-8 text-center md:p-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <Bot className="h-7 w-7 text-white" />
          </span>
          <h2 className="mt-4 font-heading text-2xl font-extrabold">
            Masih bingung? <span className="text-gradient">Tanya Aiden.</span>
          </h2>
          <p className="mt-2 max-w-md text-sm text-textsec">
            Chatbot AI kami sedia 24/7 untuk jawab soalan afiliasi, cara jana link
            dan strategi promosi.
          </p>
        </div>
      </div>
    </div>
  );
}
