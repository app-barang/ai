"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Link2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Plus,
  MousePointerClick,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  viralScore: number;
  category: string;
}

interface LinkItem {
  shortCode: string;
  url: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number | null;
  clicks: number;
  createdAt: string;
}

export default function AffiliateLinksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [pRes, lRes] = await Promise.all([
        fetch("/api/products?limit=48", { cache: "no-store" }),
        fetch("/api/affiliate/link", { cache: "no-store" }),
      ]);
      if (pRes.ok) {
        const d = await pRes.json();
        setProducts(d.products ?? []);
        if (d.products?.[0]) setSelected(d.products[0].id);
      }
      if (lRes.ok) {
        const d = await lRes.json();
        setLinks(d.links ?? []);
      }
    } catch {
      setError("Gagal memuatkan data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!selected) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/affiliate/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selected }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Gagal menjana link.");
        return;
      }
      await copy(d.url, d.shortCode);
      await load();
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setCreating(false);
    }
  };

  const copy = async (url: string, code: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          Link <span className="text-gradient">Afiliasi</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">
          Jana link unik dan kongsi — setiap klik sah dibayar.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Generator */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Link2 className="h-5 w-5 text-primary" /> Jana Link Baharu
        </h2>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-textsec">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan produk...
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-12 flex-1 rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatPrice(p.price)} (skor {p.viralScore})
                </option>
              ))}
            </select>
            <button
              onClick={create}
              disabled={!selected || creating}
              className="btn-primary !py-3 text-sm"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? "Menjana..." : "Jana Link"}
            </button>
          </div>
        )}

        <p className="mt-3 text-xs text-textsec">
          Link akan disalin automatik. Kongsi di TikTok, Instagram atau WhatsApp.
        </p>
      </div>

      {/* Senarai */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Link Saya</h2>
          <span className="text-xs text-textsec">{links.length} link</span>
        </div>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-textsec">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan...
          </div>
        ) : links.length === 0 ? (
          <p className="mt-4 rounded-xl bg-bgalt p-6 text-center text-sm text-textsec">
            Belum ada link. Jana link pertama anda di atas.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {links.map((l) => (
              <div
                key={l.shortCode}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{l.productName}</p>
                  <p className="truncate text-xs text-textsec">{l.url}</p>
                </div>
                <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  <MousePointerClick className="h-3 w-3" /> {l.clicks}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copy(l.url, l.shortCode)}
                    className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary"
                  >
                    {copied === l.shortCode ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === l.shortCode ? "Disalin" : "Salin"}
                  </button>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                    aria-label="Buka link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
