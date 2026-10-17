"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radar, Flame, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Utama", icon: Home },
  { href: "/produk", label: "Produk", icon: Flame },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/afiliator", label: "Afiliasi", icon: LayoutDashboard },
  { href: "/masuk", label: "Akaun", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                active ? "text-primary" : "text-textsec"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(255,107,0,0.6)]")} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
