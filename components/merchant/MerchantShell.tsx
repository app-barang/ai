"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Store,
  LayoutDashboard,
  Package,
  MousePointerClick,
  ShoppingBag,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/merchant/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/merchant/produk", label: "Produk", icon: Package },
  { href: "/merchant/klik", label: "Klik", icon: MousePointerClick },
  { href: "/merchant/jualan", label: "Jualan", icon: ShoppingBag },
  { href: "/merchant/langganan", label: "Langganan", icon: Wallet },
  { href: "/merchant/tetapan", label: "Tetapan", icon: Settings },
];

export default function MerchantShell({
  name,
  businessName,
  tier,
  status,
  children,
}: {
  name: string;
  businessName: string;
  tier: string;
  status: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
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
      {/* Topbar mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/merchant/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
            <Store className="h-4 w-4 text-white" />
          </span>
          <span className="font-heading text-sm font-extrabold">{businessName}</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-soft-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading font-bold">Menu Merchant</span>
              <button onClick={() => setOpen(false)} aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
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
          {/* Sidebar desktop */}
          <aside className="hidden h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:block">
            <div className="mb-4 flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                <Store className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0">
                <p className="line-clamp-1 font-heading font-bold">{businessName}</p>
                <p className="flex items-center gap-1 text-xs text-textsec">
                  <BadgeCheck className="h-3 w-3 text-primary" /> {name}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 px-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {tier}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold",
                  status === "ACTIVE"
                    ? "bg-success/10 text-success"
                    : status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                )}
              >
                {status === "ACTIVE" ? "Aktif" : status === "PENDING" ? "Menunggu" : status}
              </span>
            </div>

            <NavLinks />

            <div className="mt-4 rounded-2xl bg-bgalt p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Flame className="h-3.5 w-3.5" /> Tips
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Produk dengan skor viral tinggi lebih mudah dipromosikan afiliator.
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
