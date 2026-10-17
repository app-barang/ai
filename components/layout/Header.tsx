"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Menu, X, TrendingUp, Sparkles, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Utama" },
  { href: "/produk", label: "Produk Viral" },
  { href: "/radar", label: "Radar AI" },
  { href: "/afiliator", label: "Afiliasi" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [affMenu, setAffMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="container-custom flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Flame className="h-5 w-5 text-white" />
          </span>
          <span className="font-heading text-xl font-extrabold tracking-tight md:text-2xl">
            Barang<span className="text-gradient">Viral</span>
            <span className="text-xs align-top text-textsec">.store</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 font-heading text-sm font-semibold transition-colors",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-bgalt hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dropdown Afiliator */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setAffMenu((v) => !v)}
              onBlur={() => setTimeout(() => setAffMenu(false), 150)}
              className="btn-outline flex items-center gap-1 !px-4 !py-2 text-sm"
            >
              <TrendingUp className="h-4 w-4" />
              Afiliator
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {affMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-soft-lg"
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-bgalt"
                  >
                    <Sparkles className="h-4 w-4 text-primary" /> Dashboard
                  </Link>
                  <Link
                    href="/masuk"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-bgalt"
                  >
                    <User className="h-4 w-4 text-primary" /> Masuk
                  </Link>
                  <Link
                    href="/daftar"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-bgalt"
                  >
                    <TrendingUp className="h-4 w-4 text-primary" /> Daftar Afiliator
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/masuk" className="btn-outline hidden !px-4 !py-2 text-sm md:inline-flex">
            Masuk
          </Link>
          <Link href="/daftar" className="btn-primary hidden !px-4 !py-2 text-sm md:inline-flex">
            Daftar
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
          >
            <div className="container-custom space-y-1 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-2.5 font-heading text-sm font-semibold",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-bgalt"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                <Link href="/masuk" className="btn-outline flex-1 !py-2.5 text-sm" onClick={() => setOpen(false)}>
                  Masuk
                </Link>
                <Link href="/daftar" className="btn-primary flex-1 !py-2.5 text-sm" onClick={() => setOpen(false)}>
                  Daftar
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
