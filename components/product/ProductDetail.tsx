"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Flame,
  Star,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Share2,
  Heart,
  Check,
} from "lucide-react";
import type { Product } from "@/types";
import { formatNumber, formatPrice, getRadarColor, getRadarLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qty, setQty] = useState(1);

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-textsec">
        <Link href="/" className="hover:text-primary">Utama</Link>
        <span>/</span>
        <Link href="/#produk" className="hover:text-primary">Produk</Link>
        <span>/</span>
        <span className="text-secondary">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gambar */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-bgalt shadow-soft">
            <Image
              src={product.images[0] ?? "/placeholder-product.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.isViral && (
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow">
                <Flame className="h-4 w-4" /> PRODUK VIRAL
              </span>
            )}
            <button
              onClick={() => setLiked(!liked)}
              className={cn(
                "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft transition-all hover:scale-110",
                liked && "bg-red-50"
              )}
              aria-label="Suka"
            >
              <Heart className={cn("h-5 w-5", liked ? "fill-red-500 text-red-500" : "text-gray-400")} />
            </button>
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <div
                key={i}
                className={cn(
                  "relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-bgalt",
                  i === 0 ? "border-primary" : "border-transparent"
                )}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Butiran */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {product.marketplace} • {product.category}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-extrabold md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-textsec">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong className="text-secondary">{product.rating.toFixed(1)}</strong> penilaian
              </span>
              <span>•</span>
              <span>{formatNumber(product.sold)} terjual</span>
              <span>•</span>
              <span className={cn(product.stock < 100 && "font-semibold text-red-500")}>
                {product.stock} stok
              </span>
            </div>
          </div>

          {/* Harga */}
          <div className="rounded-2xl bg-bgalt p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-4xl font-extrabold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-textsec line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="rounded-lg bg-success px-2.5 py-1 text-xs font-bold text-white">
                    Jimat {discount}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Radar badge */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl font-heading text-lg font-extrabold text-white"
              style={{ backgroundColor: getRadarColor(product.radarScore) }}
            >
              {product.radarScore}
            </span>
            <div>
              <p className="font-heading font-bold" style={{ color: getRadarColor(product.radarScore) }}>
                {getRadarLabel(product.radarScore)}
              </p>
              <p className="text-xs text-textsec">
                Skor Radar AI — dikira daripada trend, jualan & ulasan
              </p>
            </div>
          </div>

          <p className="leading-relaxed text-gray-600">{product.description}</p>

          {/* Quantity + CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-gray-200">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-12 w-11 font-heading text-lg font-bold text-gray-500 hover:text-primary"
              >
                −
              </button>
              <span className="w-10 text-center font-heading font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="h-12 w-11 font-heading text-lg font-bold text-gray-500 hover:text-primary"
              >
                +
              </button>
            </div>
            <Link
              href={product.externalUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 !py-3.5"
            >
              <ShoppingBag className="h-5 w-5" />
              Beli Sekarang — {formatPrice(product.price * qty)}
            </Link>
            <button
              onClick={share}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:border-primary hover:text-primary"
              aria-label="Kongsi"
            >
              {copied ? <Check className="h-5 w-5 text-success" /> : <Share2 className="h-5 w-5" />}
            </button>
          </div>
          <p className="flex items-center gap-2 text-xs text-success">
            <ExternalLink className="h-3.5 w-3.5" />
            Anda akan dihantar ke {product.marketplace} untuk pembelian selamat.
          </p>

          {/* Jaminan */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
            {[
              { icon: ShieldCheck, label: "Produk Terverifikasi" },
              { icon: Truck, label: "Penghantaran Pantas" },
              { icon: RefreshCcw, label: "Pulang Mudah" },
            ].map((j) => (
              <div key={j.label} className="flex flex-col items-center gap-2 text-center">
                <j.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-gray-600">{j.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
