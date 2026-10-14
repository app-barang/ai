import ProductDetail from "@/components/product/ProductDetail";
import { getProductById, mockProducts } from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return mockProducts.map((p) => ({ id: p.slug }));
}

export default function ProductPage({ params }: Props) {
  const product = getProductById(params.id);
  if (!product) notFound();

  return (
    <>
      {/* Nota demo */}
      <div className="bg-primary/5 py-2 text-center text-xs font-semibold text-primary">
        🎮 Mod demo — data contoh. Sambungkan database untuk data sebenar.
      </div>
      <ProductDetail product={product} />
    </>
  );
}

export function generateMetadata({ params }: Props) {
  const product = getProductById(params.id);
  return {
    title: product ? `${product.name} | BarangViral.store` : "Produk | BarangViral.store",
    description: product?.description,
  };
}
