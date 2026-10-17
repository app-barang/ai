"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  Users,
  Banknote,
  Droplets,
  ShieldAlert,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/admin/merchants", label: "Merchant", icon: Store },
  { href: "/admin/affiliates", label: "Afiliator", icon: Users },
  { href: "/admin/payouts", label: "Payout", icon: Banknote },
  { href: "/admin/pool", label: "Pool", icon: Droplets },
  { href: "/admin/fraud", label: "Fraud", icon: ShieldAlert },
];

export default function AdminShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Links = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
              active
                ? "bg-secondary text-white shadow-soft"
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
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <span className="font-heading text-sm font-extrabold">Admin</span>
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
              <span className="font-heading font-bold">Menu Admin</span>
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
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:block">
            <div className="mb-4 flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                <ShieldCheck className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0">
                <p className="font-heading font-bold">Pentadbir</p>
                <p className="truncate text-xs text-textsec">{name}</p>
              </div>
            </div>
            <Links />
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
