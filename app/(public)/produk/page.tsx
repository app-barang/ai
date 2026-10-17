"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Star, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { formatNumber, formatPrice, cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  rating: number;
  sold: number;
  isViral: boolean;
  viralScore: number;
  merchant: { id: string; businessName: string };
}

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
  categories: { name: string; count: number }[];
}

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "12", sort: "viral" });
      if (category !== "Semua") qs.set("category", category);
      if (search) qs.set("search", search);
      const res = await fetch(`/api/products?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Gagal memuatkan produk. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const pickCategory = (c: string) => {
    setCategory(c);
    setPage(1);
  };

  const categories = data?.categories ?? [];
  const totalCount = categories.reduce((a, c) => a + c.count, 0);

  return (
    <div className="bg-bgalt">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container-custom py-10 md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Flame className="h-3.5 w-3.5" /> Katalog Produk
          </span>
          <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-5xl">
            Produk <span className="text-gradient">Viral</span> Malaysia
          </h1>
          <p className="mt-2 max-w-xl text-sm text-textsec md:text-base">
            Dikurasi dari merchant tempatan. Semak, banding dan sokong peniaga Malaysia.
          </p>

          <form onSubmit={submitSearch} className="mt-5 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari produk..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="btn-primary !py-3 text-sm">
              Cari
            </button>
          </form>
        </div>
      </section>

      <div className="container-custom py-8 md:py-12">
        {/* Category filter */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
          <button
            onClick={() => pickCategory("Semua")}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
              category === "Semua"
                ? "border-transparent bg-gradient-brand text-white shadow-glow"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary"
            )}
          >
            Semua ({totalCount})
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => pickCategory(c.name)}
              className={cn(
                "shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                category === c.name
                  ? "border-transparent bg-gradient-brand text-white shadow-glow"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary"
              )}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-14 text-center shadow-soft">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="mt-3 text-sm text-textsec">Memuatkan produk...</p>
          </div>
        ) : !data || data.products.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-white p-14 text-center">
            <Package className="mx-auto h-10 w-10 text-textsec" />
            <p className="mt-3 font-semibold">Tiada produk dijumpai</p>
            <p className="text-sm text-textsec">
              {search ? `Tiada hasil untuk "${search}".` : "Cuba kategori lain."}
            </p>
            {(search || category !== "Semua") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setCategory("Semua");
                  setPage(1);
                }}
                className="btn-outline mt-4 !py-2.5 text-sm"
              >
                Reset penapis
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.products.map((p) => {
                const discount = p.comparePrice
                  ? Math.round((1 - p.price / p.comparePrice) * 100)
                  : 0;
                return (
                  <article
                    key={p.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
                  >
                    <Link href={`/produk/${p.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-bgalt">
                        <Image
                          src={p.images[0] ?? "/placeholder-product.svg"}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                          {p.isViral && (
                            <span className="flex items-center gap-1 rounded-lg bg-gradient-brand px-2.5 py-1 text-[10px] font-bold text-white shadow-glow">
                              <Flame className="h-3 w-3" /> VIRAL
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="rounded-lg bg-success px-2.5 py-1 text-[10px] font-bold text-white">
                              -{discount}%
                            </span>
                          )}
                        </div>
                        <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary backdrop-blur">
                          ⚡ {p.viralScore}
                        </span>
                      </div>

                      <div className="space-y-1.5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {p.merchant?.businessName ?? p.category}
                        </p>
                        <h2 className="line-clamp-2 font-heading text-sm font-bold leading-snug md:text-base">
                          {p.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-textsec">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <strong className="text-secondary">{p.rating.toFixed(1)}</strong>
                          </span>
                          <span>•</span>
                          <span>{formatNumber(p.sold)} terjual</span>
                        </div>
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="font-heading text-lg font-extrabold text-primary">
                            {formatPrice(p.price)}
                          </span>
                          {p.comparePrice && (
                            <span className="text-xs text-textsec line-through">
                              {formatPrice(p.comparePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="px-4 pb-4">
                      <Link
                        href={`/produk/${p.slug}`}
                        className="block rounded-xl bg-gradient-brand py-2.5 text-center text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.02]"
                      >
                        Lihat
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {data.pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-textsec">
                  Halaman {data.pagination.page} / {data.pagination.pages} • {data.pagination.total} produk
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((n) => Math.max(1, n - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelum
                  </button>
                  <button
                    onClick={() => setPage((n) => Math.min(data.pagination.pages, n + 1))}
                    disabled={page >= data.pagination.pages}
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    Seterusnya <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
