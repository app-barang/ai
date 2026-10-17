import Link from "next/link";
import { Compass, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </span>

        <p className="mt-6 font-heading text-7xl font-extrabold leading-none text-gradient">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-secondary">
          Halaman tidak dijumpai
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-textsec">
          Maaf, halaman yang anda cari mungkin telah dipindahkan atau tidak wujud lagi.
          Mari kembali ke tempat yang betul.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home className="h-4 w-4" /> Kembali ke Utama
          </Link>
          <Link href="/produk" className="btn-outline">
            <ShoppingBag className="h-4 w-4" /> Lihat Produk
          </Link>
        </div>

        <p className="mt-8 text-xs text-textsec">
          Perlu bantuan?{" "}
          <Link href="/#faq" className="font-semibold text-primary hover:underline">
            Baca FAQ
          </Link>{" "}
          atau buka chatbot Vira di penjuru kanan.
        </p>
      </div>
    </main>
  );
}
