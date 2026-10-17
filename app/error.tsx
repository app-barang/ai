"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log untuk diagnostik (tidak dipaparkan kepada pengguna)
    console.error("[App Error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <AlertTriangle className="h-8 w-8" />
        </span>

        <p className="mt-6 font-heading text-6xl font-extrabold leading-none text-gradient">500</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-secondary">
          Maaf, berlaku ralat
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-textsec">
          Sistem kami mengalami masalah sementara. Data anda selamat — sila cuba semula.
          Jika masalah berterusan, hubungi pasukan sokongan kami.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Cuba Lagi
          </button>
          <Link href="/" className="btn-outline">
            <Home className="h-4 w-4" /> Kembali ke Utama
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[11px] text-textsec">
            Kod ralat: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  );
}
