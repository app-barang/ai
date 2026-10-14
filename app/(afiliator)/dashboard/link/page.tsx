"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  Wallet,
  Settings,
  Copy,
  Check,
  ExternalLink,
  MousePointerClick,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import LinkGenerator from "@/components/affiliate/LinkGenerator";
import { mockRecentLinks } from "@/lib/mock-data";
import { formatNumber, formatPrice, cn } from "@/lib/utils";

const menu = [
  { href: "/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/dashboard/link", label: "Link Afiliasi", icon: Link2 },
  { href: "/dashboard/promosi", label: "Promosi", icon: Megaphone },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: Settings },
];

export default function LinkPage() {
  const [active] = useState("/dashboard/link");
  const [copied, setCopied] = useState<string | null>(null);
  const [links, setLinks] = useState(mockRecentLinks);

  // Ambil link sebenar dari API (fallback ke data demo)
  useEffect(() => {
    fetch("/api/affiliate/commissions")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.links && Array.isArray(data.links) && data.links.length > 0) {
          setLinks(
            data.links.map((l: {
              shortCode: string;
              productName: string;
              clicks: number;
              conversions: number;
              earnings: number;
              createdAt: string;
            }) => ({
              id: l.shortCode,
              shortCode: l.shortCode,
              product: l.productName,
              clicks: l.clicks,
              conversions: l.conversions,
              earnings: l.earnings,
              createdAt: l.createdAt,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/r/${code}`);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

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
            <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
              Link <span className="text-gradient">Afiliasi</span>
            </h1>

            <LinkGenerator commissionRate={0.35} />

            {/* Senarai link */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
              <h2 className="font-heading text-lg font-bold">Link Terkini</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-wider text-textsec">
                      <th className="pb-3">Produk</th>
                      <th className="pb-3">Short Code</th>
                      <th className="pb-3 text-right">Klik</th>
                      <th className="pb-3 text-right">Konversi</th>
                      <th className="pb-3 text-right">Pendapatan</th>
                      <th className="pb-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((l) => (
                      <tr key={l.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 font-semibold">{l.product}</td>
                        <td className="py-3">
                          <code className="rounded bg-bgalt px-2 py-0.5 font-mono text-xs text-primary">
                            /r/{l.shortCode}
                          </code>
                        </td>
                        <td className="py-3 text-right">
                          <span className="flex items-center justify-end gap-1 text-textsec">
                            <MousePointerClick className="h-3.5 w-3.5" />
                            {formatNumber(l.clicks)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="flex items-center justify-end gap-1 text-textsec">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {l.conversions}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-success">
                          {formatPrice(l.earnings)}
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => copy(l.shortCode)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                              aria-label="Salin"
                            >
                              {copied === l.shortCode ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <a
                              href={`/r/${l.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                              aria-label="Buka"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
