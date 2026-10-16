"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Flame,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

export default function DaftarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"BUYER" | "AFFILIATE">("BUYER");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Kata laluan sekurang-kurangnya 8 aksara.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
        return;
      }

      // 2. Auto-login guna credentials
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Akaun dicipta, sila log masuk.");
        router.push("/masuk");
        return;
      }

      // 3. Redirect ke members area
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

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
            Jadi <span className="text-gradient">ahli BarangViral</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">Percuma. Mula berjaya hari ini.</p>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {/* Peranan */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("BUYER")}
              className={
                role === "BUYER"
                  ? "rounded-xl bg-gradient-brand p-3 text-center text-white shadow-glow"
                  : "rounded-xl border border-gray-200 bg-bgalt p-3 text-center"
              }
            >
              <User className={`mx-auto h-5 w-5 ${role === "BUYER" ? "text-white" : "text-primary"}`} />
              <p className={`mt-1 text-sm font-bold ${role === "BUYER" ? "text-white" : "text-secondary"}`}>
                Pembeli
              </p>
              <p className={`text-[10px] ${role === "BUYER" ? "text-white/70" : "text-textsec"}`}>
                Beli produk viral
              </p>
            </button>
            <button
              type="button"
              onClick={() => setRole("AFFILIATE")}
              className={cn(
                "rounded-xl border p-3 text-center transition-all",
                role === "AFFILIATE"
                  ? "border-transparent bg-gradient-brand text-white shadow-glow"
                  : "border-gray-200 bg-bgalt hover:border-primary"
              )}
            >
              <TrendingUp className={`mx-auto h-5 w-5 ${role === "AFFILIATE" ? "text-white" : "text-primary"}`} />
              <p className={`mt-1 text-sm font-bold ${role === "AFFILIATE" ? "text-white" : "text-secondary"}`}>
                Afiliator
              </p>
              <p className={`text-[10px] ${role === "AFFILIATE" ? "text-white/70" : "text-textsec"}`}>
                Komisen sehingga 50%
              </p>
            </button>
          </div>

          {role === "AFFILIATE" ? (
            <Link href="/daftar/afiliasi" className="btn-primary w-full">
              <TrendingUp className="h-4 w-4" />
              Daftar Afiliator (4 Langkah)
            </Link>
          ) : (
          <>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Nama Penuh</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama anda"
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-4 text-sm outline-none placeholder:text-textsec focus:border-primary"
              />
            </div>
          </div>

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
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-4 text-sm outline-none placeholder:text-textsec focus:border-primary"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 aksara"
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-11 text-sm outline-none placeholder:text-textsec focus:border-primary"
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
            {loading ? "Mendaftar..." : "Daftar Akaun"}
          </button>
          </>
          )}
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-textsec">
          Dengan mendaftar, anda bersetuju dengan
          <span className="font-semibold text-secondary"> Dasar Privasi</span> dan{" "}
          <span className="font-semibold text-secondary">Terma Perkhidmatan</span> kami.
        </p>

        <p className="mt-4 text-center text-sm text-textsec">
          Sudah ada akaun?{" "}
          <Link href="/masuk" className="font-bold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
