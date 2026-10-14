"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Copy, Check, Plus, ExternalLink, Sparkles } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { generateShortCode, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function LinkGenerator({ commissionRate = 0.3 }: { commissionRate?: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [links, setLinks] = useState<{ product: string; code: string; url: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const product = mockProducts.find((p) => p.id === selected);

  const generate = async () => {
    if (!product) return;
    const code = generateShortCode();
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://barangviral.store"}/r/${code}`;
    setLinks((l) => [{ product: product.name, code, url }, ...l]);
    setSelected(null);
  };

  const copy = async (url: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
          <Link2 className="h-5 w-5 text-white" />
        </span>
        <div>
          <h3 className="font-heading text-xl font-bold">Jana Link Afiliasi</h3>
          <p className="text-sm text-textsec">
            Komisen anda: <strong className="text-success">{(commissionRate * 100).toFixed(0)}%</strong> setiap jualan
          </p>
        </div>
      </div>

      {/* Pilih produk */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold">Pilih Produk</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {mockProducts.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                selected === p.id
                  ? "border-transparent bg-gradient-brand text-white shadow-glow"
                  : "border-gray-200 hover:border-primary"
              )}
            >
              <div>
                <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                <p className={cn("text-xs", selected === p.id ? "text-white/80" : "text-textsec")}>
                  {formatPrice(p.price)} • {(commissionRate * p.price).toFixed(2)} komisen
                </p>
              </div>
              {p.isViral && <Sparkles className={cn("h-4 w-4", selected === p.id ? "text-white" : "text-primary")} />}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!selected}
        className="btn-primary mt-5 w-full"
      >
        <Plus className="h-4 w-4" />
        Jana Link
      </button>

      {links.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-2">
          <p className="text-sm font-semibold">Link anda ({links.length})</p>
          {links.map((l, i) => (
            <div
              key={l.code}
              className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-bgalt p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{l.product}</p>
                <p className="truncate text-xs text-textsec">{l.url}</p>
              </div>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-primary"
                aria-label="Buka link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => copy(l.url, i)}
                className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary"
              >
                {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedIdx === i ? "Disalin" : "Salin"}
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
