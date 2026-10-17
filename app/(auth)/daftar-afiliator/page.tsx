"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Smartphone,
  Users,
  Landmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PasswordInput from "@/components/ui/PasswordInput";

const steps = [
  { title: "Info Peribadi", icon: User },
  { title: "Media Sosial", icon: Smartphone },
  { title: "Rujukan & Bank", icon: Landmark },
];

export default function DaftarAfiliatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [noSocial, setNoSocial] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
    tiktok: "",
    instagram: "",
    youtube: "",
    followers: "",
    uplineCode: "",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (s: number): string | null => {
    if (s === 0) {
      if (!form.name.trim()) return "Nama penuh diperlukan.";
      if (!form.email.includes("@")) return "Email tidak sah.";
      if (form.username.trim().length < 3) return "Username minimum 3 aksara.";
      if (form.password.length < 8) return "Kata laluan minimum 8 aksara.";
    }
    // Media sosial adalah PILIHAN — tiada validasi wajib.
    return null;
  };

  const next = () => {
    const err = validate(step);
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
          followers: form.followers ? parseInt(form.followers) : null,
          uplineCode: form.uplineCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
        return;
      }

      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (login?.error) {
        setError("Akaun berjaya dicipta. Sila log masuk.");
        router.push("/masuk");
        return;
      }

      router.push("/afiliator/dashboard");
      router.refresh();
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-bgalt px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-viral-pink/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-viral-pink">
            <TrendingUp className="h-3.5 w-3.5" /> Pendaftaran Afiliator
          </span>
          <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
            Jana 4 <span className="text-gradient">Income Streams</span>
          </h1>
          <p className="mt-2 text-sm text-textsec">
            Percuma selamanya. Tiada modal, tiada stok.
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

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-bold">Info Peribadi</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field icon={User} label="Nama Penuh" value={form.name} onChange={update("name")} placeholder="Nama anda" />
                    <Field icon={AtSign} label="Username" value={form.username} onChange={update("username")} placeholder="cth: ahmadviral" />
                  </div>
                  <Field icon={Mail} label="Email" type="email" value={form.email} onChange={update("email")} placeholder="anda@contoh.com" />
                  <Field icon={Lock} label="Kata Laluan" type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 aksara" />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-bold">Media Sosial (Pilihan)</h2>
                  <p className="text-xs leading-relaxed text-textsec">
                    Ada akaun TikTok atau Instagram? Masukkan username anda. Kalau belum ada,
                    tak mengapa, anda boleh tambah kemudian di dalam Dashboard.
                  </p>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <input
                      type="checkbox"
                      checked={noSocial}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNoSocial(checked);
                        if (checked) {
                          setForm((f) => ({
                            ...f,
                            tiktok: "",
                            instagram: "",
                            youtube: "",
                            followers: "",
                          }));
                        }
                      }}
                      className="mt-0.5 h-4 w-4 accent-[#FF6B00]"
                    />
                    <span className="text-sm font-semibold text-secondary">
                      Saya belum ada akaun media sosial / Saya baru nak mula
                    </span>
                  </label>

                  <Field
                    icon={Smartphone}
                    label="TikTok"
                    value={form.tiktok}
                    onChange={update("tiktok")}
                    placeholder="cth: @ali_barangviral"
                    disabled={noSocial}
                  />
                  <Field
                    icon={AtSign}
                    label="Instagram"
                    value={form.instagram}
                    onChange={update("instagram")}
                    placeholder="cth: @ali_official"
                    disabled={noSocial}
                  />
                  <Field
                    icon={Smartphone}
                    label="YouTube"
                    value={form.youtube}
                    onChange={update("youtube")}
                    placeholder="URL channel (pilihan)"
                    disabled={noSocial}
                  />
                  <Field
                    icon={Users}
                    label="Jumlah Followers (pilihan)"
                    type="number"
                    value={form.followers}
                    onChange={update("followers")}
                    placeholder="cth: 10000 (Kosongkan jika tiada)"
                    disabled={noSocial}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-bold">Rujukan & Bank</h2>
                  <Field icon={Gift} label="Kod Rujukan (pilihan)" value={form.uplineCode} onChange={update("uplineCode")} placeholder="username upline anda" />
                  <p className="text-xs text-textsec">
                    Untuk bayaran komisen. Pastikan nama sepadan dengan akaun bank.
                  </p>
                  <Field icon={Landmark} label="Nama Bank" value={form.bankName} onChange={update("bankName")} placeholder="cth: Maybank" />
                  <Field icon={Landmark} label="No. Akaun" value={form.bankAccount} onChange={update("bankAccount")} placeholder="1234567890" />
                  <Field icon={User} label="Nama Pemegang Akaun" value={form.bankHolder} onChange={update("bankHolder")} placeholder="Nama pada akaun bank" />
                  <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 p-4">
                    <p className="text-sm font-bold text-primary">Komisen bermula 30%</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Kadar naik mengikut prestasi sehingga 50% + 4 income streams.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <div className="mt-7 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={back} className="btn-outline !px-5">
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
            ) : (
              <Link href="/masuk" className="text-sm font-semibold text-textsec hover:text-primary">
                ← Sudah ada akaun?
              </Link>
            )}

            {step < steps.length - 1 ? (
              <button onClick={next} className="btn-primary !px-6">
                Seterusnya <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="btn-primary !px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {loading ? "Mendaftar..." : "Daftar & Teruskan"}
              </button>
            )}
          </div>
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
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {type === "password" ? (
        <PasswordInput
          icon={Icon}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="new-password"
        />
      ) : (
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
}
