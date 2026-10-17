import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatNumber, formatPrice } from "@/lib/utils";
import { Flame, Star, ShoppingBag, Store, ShieldCheck, Truck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product
    .findUnique({
      where: { slug: params.slug },
      include: {
        merchant: { select: { id: true, businessName: true, tier: true, status: true } },
      },
    })
    .catch(() => null);

  if (!product || !product.isActive) notFound();

  // Tambah kiraan paparan (tidak menyekat render)
  prisma.product
    .update({ where: { id: product.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const related = await prisma.product
    .findMany({
      where: { isActive: true, category: product.category, id: { not: product.id } },
      orderBy: { sold: "desc" },
      take: 4,
      select: { id: true, name: true, slug: true, price: true, images: true, sold: true, rating: true },
    })
    .catch(() => []);

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="container-custom py-8 md:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-textsec">
        <Link href="/" className="hover:text-primary">Utama</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/#produk" className="hover:text-primary">Produk</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-secondary">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-bgalt shadow-soft">
          <Image
            src={product.images[0] ?? "/placeholder-product.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {product.isViral && (
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow">
              <Flame className="h-4 w-4" /> PRODUK VIRAL
            </span>
          )}
          {discount > 0 && (
            <span className="absolute right-4 top-4 rounded-xl bg-success px-3 py-1.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {product.category} • {product.merchant?.businessName ?? "Merchant"}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-extrabold md:text-4xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-textsec">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong className="text-secondary">{product.rating.toFixed(1)}</strong>
              </span>
              <span>•</span>
              <span>{formatNumber(product.sold)} terjual</span>
              <span>•</span>
              <span>{product.stock} stok</span>
            </div>
          </div>

          <div className="rounded-2xl bg-bgalt p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-4xl font-extrabold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-lg text-textsec line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          <p className="leading-relaxed text-gray-600">{product.description}</p>

          <Link
            href={`/merchant/${product.merchantId}`}
            className="flex items-center gap-2 rounded-2xl border border-gray-100 p-4 text-sm font-semibold hover:border-primary"
          >
            <Store className="h-4 w-4 text-primary" />
            {product.merchant?.businessName ?? "Lihat Merchant"}
            <ChevronRight className="ml-auto h-4 w-4 text-textsec" />
          </Link>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-bgalt p-4 text-center">
            <ShoppingBag className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold">Pembelian dalam talian akan dibuka tidak lama lagi</p>
            <p className="mt-1 text-xs text-textsec">
              Buat masa ini, hubungi merchant untuk pembelian. Afiliator boleh kongsi link produk ini.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
            {[
              { icon: ShieldCheck, label: "Produk Terverifikasi" },
              { icon: Truck, label: "Penghantaran Pantas" },
              { icon: Flame, label: "Trending" },
            ].map((j) => (
              <div key={j.label} className="flex flex-col items-center gap-2 text-center">
                <j.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-gray-600">{j.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-extrabold">
            Produk <span className="text-gradient">Berkaitan</span>
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/produk/${r.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-bgalt">
                  <Image
                    src={r.images[0] ?? "/placeholder-product.svg"}
                    alt={r.name}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-bold">{r.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-primary">{formatPrice(r.price)}</p>
                  <p className="text-xs text-textsec">{formatNumber(r.sold)} terjual</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
