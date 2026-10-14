"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  category?: string;
}

export default function ProductGrid({ category = "Semua" }: Props) {
  const products =
    category === "Semua"
      ? mockProducts
      : mockProducts.filter((p) => p.category === category);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-textsec">
        Tiada produk dalam kategori ini. Cuba kategori lain!
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Link href={`/produk/${p.slug}`}>
            <ProductCard product={p} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
