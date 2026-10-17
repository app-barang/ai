import Link from "next/link";
import { XCircle, RefreshCw, Home } from "lucide-react";

export const metadata = { title: "Pembayaran Gagal — BarangViral" };

export default function PaymentFailedPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const isSubscription = searchParams?.type === "subscription";
  const retryHref = isSubscription ? "/merchant/langganan" : "/produk";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-soft md:p-10">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-10 w-10 text-red-500" />
        </span>

        <h1 className="mt-6 font-heading text-2xl font-extrabold text-secondary md:text-3xl">
          Pembayaran Tidak Berjaya
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-textsec">
          Maaf, pembayaran anda tidak dapat diproses. Tiada caj dibuat — sila cuba semula.
        </p>

        <div className="mt-5 rounded-2xl bg-bgalt p-4 text-left text-xs leading-relaxed text-gray-600">
          Jika masalah berterusan, pastikan kad/kaedah pembayaran anda sah, atau hubungi
          sokongan di{" "}
          <a href="mailto:sokongan@barangviral.store" className="font-semibold text-primary">
            sokongan@barangviral.store
          </a>
          .
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={retryHref} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Cuba Lagi
          </Link>
          <Link href="/" className="btn-outline">
            <Home className="h-4 w-4" /> Kembali ke Utama
          </Link>
        </div>
      </div>
    </main>
  );
}
