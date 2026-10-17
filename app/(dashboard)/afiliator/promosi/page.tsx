"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Loader2, Flame, Link2, ArrowRight } from "lucide-react";
import CaptionGenerator from "@/components/ai/CaptionGenerator";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  viralScore?: number;
}

export default function AffiliatePromosiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?sort=viral&limit=8", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProducts(d?.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          <span className="text-gradient">Promosi</span> Afiliasi
        </h1>
        <p className="mt-1 text-sm text-textsec">
          Jana caption viral dengan AI dan kongsi link anda.
        </p>
      </div>

      <CaptionGenerator />

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Flame className="h-5 w-5 text-primary" /> Produk Trending Untuk Dipromosi
        </h2>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-textsec">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan produk...
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand font-heading text-xs font-bold text-white shadow-glow">
                  {p.viralScore ?? 0}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-textsec">{formatPrice(p.price)}</p>
                </div>
                <Link
                  href="/afiliator/link"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white"
                  aria-label="Jana link"
                >
                  <Link2 className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/afiliator/link"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Jana link untuk produk ini <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
