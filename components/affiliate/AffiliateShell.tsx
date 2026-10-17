"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  TrendingUp,
  LayoutDashboard,
  Link2,
  Megaphone,
  Wallet,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const nav = [
  { href: "/afiliator/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/afiliator/link", label: "Link Afiliasi", icon: Link2 },
  { href: "/afiliator/promosi", label: "Promosi", icon: Megaphone },
  { href: "/afiliator/wallet", label: "Wallet", icon: Wallet },
  { href: "/afiliator/team", label: "Team", icon: Users },
  { href: "/afiliator/tetapan", label: "Tetapan", icon: Settings },
];

export default function AffiliateShell({
  name,
  username,
  tier,
  balance,
  children,
}: {
  name: string;
  username: string;
  tier: string;
  balance: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Links = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
              active
                ? "bg-gradient-brand text-white shadow-glow"
                : "text-gray-600 hover:bg-bgalt"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bgalt">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/afiliator/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
            <TrendingUp className="h-4 w-4 text-white" />
          </span>
          <span className="font-heading text-sm font-extrabold">@{username}</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-soft-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading font-bold">Menu Afiliator</span>
              <button onClick={() => setOpen(false)} aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Links onNavigate={() => setOpen(false)} />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-6 flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-red-600"
            >
              <LogOut className="h-4 w-4" /> Log Keluar
            </button>
          </div>
        </div>
      )}

      <div className="container-custom py-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:block">
            <div className="mb-4 flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                <TrendingUp className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0">
                <p className="line-clamp-1 font-heading font-bold">@{username}</p>
                <p className="text-xs text-textsec">{name}</p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl bg-gradient-brand p-4 text-white">
              <p className="text-[11px] uppercase tracking-wider text-white/80">Baki boleh keluar</p>
              <p className="mt-1 font-heading text-2xl font-extrabold">{formatPrice(balance)}</p>
              <span className="mt-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
                {tier}
              </span>
            </div>

            <Links />

            <div className="mt-4 rounded-2xl bg-bgalt p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Flame className="h-3.5 w-3.5" /> 4 Income Streams
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Klik, sewa merchant, jualan & team — semua dalam satu dashboard.
              </p>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-4 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Log Keluar
            </button>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
