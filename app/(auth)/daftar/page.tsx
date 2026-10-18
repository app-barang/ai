import Link from "next/link";
import { Store, Users, ArrowRight, Flame } from "lucide-react";

export default function DaftarChooserPage() {
  return (
    <div className="flex min-h-[80vh] items-center bg-bgalt px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <Flame className="h-7 w-7 text-white" />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
            Pilih <span className="text-gradient">peranan anda</span>
          </h1>
          <p className="mt-2 text-sm text-textsec">
            Sama ada jual produk atau jana komisen — dua-dua boleh untung.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/daftar-merchant"
            className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-heading text-xl font-bold">Merchant</h2>
            <p className="mt-1 text-sm text-textsec">
              Jual produk anda. 90–100% hasil jualan milik anda, akses 1,000+ afiliator.
            </p>
            <p className="mt-3 text-sm font-bold text-primary">
              Mulai RM30/bulan
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Daftar Merchant <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/daftar-afiliator"
            className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-viral-pink/10 text-viral-pink">
              <Users className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-heading text-xl font-bold">Afiliator</h2>
            <p className="mt-1 text-sm text-textsec">
              Kongsi link, dapat 4 income streams. Percuma selamanya.
            </p>
            <p className="mt-3 text-sm font-bold text-viral-pink">Percuma</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-viral-pink">
              Daftar Afiliator <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-textsec">
          Sudah ada akaun?{" "}
          <Link href="/masuk" className="font-bold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
