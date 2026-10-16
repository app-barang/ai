import Image from "next/image";
import { Flame, Star, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { formatNumber, formatPrice, getRadarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: Props) {
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <article
      className={cn(
        "card-soft group overflow-hidden !p-0 active:scale-[0.98] transition-transform",
        className
      )}
    >
      {/* Gambar */}
      <div className="relative aspect-square overflow-hidden bg-bgalt">
        <Image
          src={product.images[0] ?? "/placeholder-product.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isViral && (
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
        {/* Skor radar */}
        <span
          className="absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow"
          style={{ backgroundColor: getRadarColor(product.radarScore) }}
        >
          ⚡ {product.radarScore}
        </span>
        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-secondary">
            <ShoppingBag className="h-4 w-4 text-primary" /> Semak Produk
          </span>
        </div>
      </div>

      {/* Isi */}
      <div className="space-y-2 p-4 active:bg-bgalt/50">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {product.marketplace}
        </span>
        <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug md:text-base">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-textsec">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <strong className="text-secondary">{product.rating.toFixed(1)}</strong>
          </span>
          <span>•</span>
          <span>{formatNumber(product.sold)} terjual</span>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-heading text-lg font-extrabold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-textsec line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
