"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  AtSign,
  Lock,
  Mail,
  Smartphone,
  Users,
  Landmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Info Peribadi", desc: "Nama & akaun", icon: User },
  { title: "Media Sosial", desc: "Channel anda", icon: Smartphone },
  { title: "Pembayaran", desc: "Untuk komisen", icon: Landmark },
  { title: "Sahkan", desc: "Semak & hantar", icon: CheckCircle2 },
];

export default function DaftarAfiliasiPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
    tiktok: "",
    instagram: "",
    youtube: "",
    followers: "",
    bankName: "",
    bankAccount: "",
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!form.name.trim()) return "Nama diperlukan.";
      if (!form.email.includes("@")) return "Email tidak sah.";
      if (form.password.length < 8) return "Kata laluan min. 8 aksara.";
      if (form.username.trim().length < 3) return "Username min. 3 aksara.";
    }
    if (s === 1) {
      if (!form.tiktok && !form.instagram && !form.youtube)
        return "Isi sekurang-kurangnya satu media sosial.";
    }
    if (s === 2) {
      if (!form.bankName.trim()) return "Nama bank diperlukan.";
      if (!form.bankAccount.trim()) return "No. akaun diperlukan.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          followers: parseInt(form.followers) || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
        setLoading(false);
        return;
      }

      // Auto login
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setDone(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1800);
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-bgalt px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Pendaftaran Afiliator
          </span>
          <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
            Jadi Afiliator <span className="text-gradient">BarangViral</span>
          </h1>
          <p className="mt-2 text-sm text-textsec">
            4 langkah sahaja — komisen <strong className="text-success">sehingga 50%</strong> menanti.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const complete = i < step;
            return (
              <div key={s.title} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all",
                      complete
                        ? "border-success bg-success text-white"
                        : active
                        ? "border-transparent bg-gradient-brand text-white shadow-glow"
                        : "border-gray-200 bg-white text-textsec"
                    )}
                  >
                    {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </span>
                  <span
                    className={cn(
                      "mt-2 text-center text-[11px] font-bold",
                      active ? "text-primary" : complete ? "text-success" : "text-textsec"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 mb-6 h-0.5 flex-1 rounded transition-colors",
                      i < step ? "bg-success" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft md:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
                <h2 className="mt-4 font-heading text-2xl font-extrabold">
                  Tahniah! <span className="text-gradient">Akaun afiliator aktif.</span>
                </h2>
                <p className="mt-2 text-sm text-textsec">
                  Membawa anda ke dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-lg font-bold">Info Peribadi</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field icon={User} label="Nama Penuh" value={form.name} onChange={update("name")} placeholder="Ahmad Afiliator" />
                      <Field icon={AtSign} label="Username" value={form.username} onChange={update("username")} placeholder="ahmadviral" prefix="@" />
                    </div>
                    <Field icon={Mail} label="Email" type="email" value={form.email} onChange={update("email")} placeholder="anda@contoh.com" />
                    <Field icon={Lock} label="Kata Laluan" type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 aksara" />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-lg font-bold">Media Sosial</h2>
                    <p className="text-xs text-textsec">
                      Diperlukan untuk pengesahan afiliator. Isi sekurang-kurangnya satu.
                    </p>
                    <Field icon={Smartphone} label="TikTok" value={form.tiktok} onChange={update("tiktok")} placeholder="@username" />
                    <Field icon={AtSign} label="Instagram" value={form.instagram} onChange={update("instagram")} placeholder="@username" />
                    <Field icon={Youtube} label="YouTube" value={form.youtube} onChange={update("youtube")} placeholder="URL channel" />
                    <Field icon={Sparkles} label="Jumlah Followers (pilihan)" type="number" value={form.followers} onChange={update("followers")} placeholder="cth: 10000" />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-lg font-bold">Butiran Pembayaran</h2>
                    <p className="text-xs text-textsec">
                      Komisen dibayar ke akaun ini. Pastikan nama sepadan dengan akaun bank.
                    </p>
                    <Field icon={Landmark} label="Nama Bank" value={form.bankName} onChange={update("bankName")} placeholder="cth: Maybank" />
                    <Field icon={Landmark} label="No. Akaun" value={form.bankAccount} onChange={update("bankAccount")} placeholder="1234-5678-9012" />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-lg font-bold">Sahkan Maklumat</h2>
                    <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100">
                      <Row label="Nama" value={form.name} />
                      <Row label="Username" value={`@${form.username}`} />
                      <Row label="Email" value={form.email} />
                      <Row label="TikTok" value={form.tiktok || "-"} />
                      <Row label="Instagram" value={form.instagram || "-"} />
                      <Row label="YouTube" value={form.youtube || "-"} />
                      <Row label="Bank" value={`${form.bankName} •••• ${form.bankAccount.slice(-4)}`} />
                    </div>
                    <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 p-4 text-sm">
                      <p className="flex items-center gap-2 font-bold text-primary">
                        <Flame className="h-4 w-4" /> Komisen anda bermula pada 30%
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Naik sehingga 50% mengikut prestasi jualan bulanan.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {/* Navigasi */}
          {!done && (
            <div className="mt-7 flex items-center justify-between">
              {step > 0 ? (
                <button onClick={back} className="btn-outline !px-5">
                  <ChevronLeft className="h-4 w-4" /> Kembali
                </button>
              ) : (
                <Link href="/daftar" className="text-sm font-semibold text-textsec hover:text-primary">
                  ← Kembali
                </Link>
              )}

              {step < steps.length - 1 ? (
                <button onClick={next} className="btn-primary !px-6">
                  Seterusnya <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={submit} disabled={loading} className="btn-primary !px-6">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? "Mendaftar..." : "Hantar & Buka Akaun"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  prefix,
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
        {prefix && (
          <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-semibold text-textsec">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "h-12 w-full rounded-xl border border-gray-200 bg-bgalt text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary",
            prefix ? "pl-[2.75rem]" : "pl-11"
          )}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-textsec">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
