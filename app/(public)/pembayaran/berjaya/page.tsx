import Link from "next/link";
import { CheckCircle2, LayoutDashboard, ShoppingBag, Clock } from "lucide-react";

export const metadata = { title: "Pembayaran Berjaya — BarangViral" };

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const isSubscription = searchParams?.type === "subscription";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-soft md:p-10">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </span>

        <h1 className="mt-6 font-heading text-2xl font-extrabold text-secondary md:text-3xl">
          Pembayaran <span className="text-gradient">Berjaya!</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-textsec">
          Terima kasih! Pembayaran anda telah diterima dan sedang disahkan secara automatik.
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-bgalt p-4 text-left">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-gray-600">
            {isSubscription
              ? "Langganan anda akan diaktifkan dalam beberapa saat selepas pengesahan gateway. Muat semula halaman langganan jika status masih belum berubah."
              : "Status pesanan anda akan dikemas kini dalam beberapa saat. Sila semak semula pesanan anda."}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {isSubscription ? (
            <Link href="/merchant/langganan" className="btn-primary">
              <LayoutDashboard className="h-4 w-4" /> Lihat Langganan
            </Link>
          ) : (
            <Link href="/produk" className="btn-primary">
              <ShoppingBag className="h-4 w-4" /> Terus Belanja
            </Link>
          )}
          <Link href="/" className="btn-outline">
            Kembali ke Utama
          </Link>
        </div>
      </div>
    </main>
  );
}
