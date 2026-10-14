"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  Wallet,
  Settings,
  Wand2,
  Flame,
} from "lucide-react";
import { useState } from "react";
import CaptionGenerator from "@/components/ai/CaptionGenerator";
import { mockProducts } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/dashboard/link", label: "Link Afiliasi", icon: Link2 },
  { href: "/dashboard/promosi", label: "Promosi", icon: Megaphone },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: Settings },
];

export default function PromosiPage() {
  const [active] = useState("/dashboard/promosi");

  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-10">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24">
            <nav className="space-y-1">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    active === m.href
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-gray-600 hover:bg-bgalt"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
                Promosi <span className="text-gradient">Afiliasi</span>
              </h1>
              <p className="mt-1 text-sm text-textsec">
                Jana caption viral dengan AI dan kongsi terus ke media sosial.
              </p>
            </div>

            <CaptionGenerator />

            {/* Produk cadangan untuk promosi */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <Flame className="h-5 w-5 text-primary" />
                Cadangan Promosi Hari Ini
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {mockProducts.slice(0, 4).map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand font-heading text-xs font-bold text-white shadow-glow">
                      {p.radarScore}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold">{p.name}</p>
                      <p className="text-xs text-textsec">
                        {formatPrice(p.price)} • {p.marketplace}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/promosi?product=${p.slug}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white"
                      aria-label="Jana caption"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
