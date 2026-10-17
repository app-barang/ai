"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Flame, AlertCircle, Loader2, Store, Users } from "lucide-react";

const SHOW_GOOGLE = false; // sementara: isu Google 401 disabled_client

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const routeByRole = async () => {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const session = await res.json().catch(() => null);
    const role = session?.user?.role as string | undefined;
    if (role === "MERCHANT") router.push("/merchant/dashboard");
    else if (role === "AFFILIATE") router.push("/afiliator/dashboard");
    else if (role === "ADMIN") router.push("/admin");
    else router.push("/");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError(
          res.error === "Pengguna tidak dijumpai"
            ? "Akaun tidak dijumpai. Sila daftar dahulu."
            : res.error === "Kata laluan salah"
              ? "Kata laluan tidak tepat. Cuba lagi."
              : "Gagal masuk. Sila cuba lagi."
        );
        return;
      }
      await routeByRole();
    } catch {
      setError("Sambungan bermasalah. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const google = () => signIn("google", { callbackUrl: "/selepas-login" });

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bgalt px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-soft md:p-10"
      >
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <Flame className="h-7 w-7 text-white" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-extrabold">
            Selamat <span className="text-gradient">datang kembali</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">Masuk untuk teruskan ke dashboard anda</p>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anda@contoh.com"
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Kata Laluan</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-11 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textsec hover:text-primary"
                aria-label="Papar kata laluan"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {SHOW_GOOGLE && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-textsec">
              <span className="h-px flex-1 bg-gray-200" />
              atau teruskan dengan
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              onClick={google}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold transition-colors hover:border-primary"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2 3.5-5 3.5-8.6z"/>
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.14.01-3.6 2.8-.05.13C3.4 21.3 7.4 24 12 24z"/>
                <path fill="#FBBC05" d="M5.2 14.4c-.25-.7-.4-1.5-.4-2.4s.15-1.7.4-2.4l-.01-.16-3.65-2.8-.12.06A12 12 0 000 12c0 1.9.5 3.8 1.4 5.4l3.8-3z"/>
                <path fill="#EA4335" d="M12 4.6c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l3.8 3c.9-2.9 3.6-5 6.8-5z"/>
              </svg>
              Login dengan Google
            </button>
          </>
        )}

        <div className="mt-6 rounded-2xl bg-bgalt p-4">
          <p className="text-center text-sm font-semibold text-secondary">
            Belum ada akaun?
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/daftar-merchant"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <Store className="h-3.5 w-3.5" /> Merchant
            </Link>
            <Link
              href="/daftar-afiliator"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <Users className="h-3.5 w-3.5" /> Afiliator
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
