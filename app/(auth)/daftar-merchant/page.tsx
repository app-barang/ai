"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  Landmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertCircle,
  Loader2,
  Sparkles,
  BadgeCheck,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Info Bisnes", icon: Store },
  { title: "Pilih Tier", icon: Rocket },
  { title: "Bank & Akaun", icon: Landmark },
];

const tiers = [
  {
    id: "STARTER",
    name: "STARTER",
    price: 30,
    products: "5 produk",
    desc: "Sesuai untuk mula kecil-kecilan.",
    icon: Sparkles,
  },
  {
    id: "PRO",
    name: "PRO",
    price: 99,
    products: "20 produk",
    desc: "Paling popular — featured listing.",
    icon: BadgeCheck,
    popular: true,
  },
  {
    id: "BUSINESS",
    name: "BUSINESS",
    price: 199,
    products: "Unlimited",
    desc: "Untuk jenama yang mahu berkembang.",
    icon: Rocket,
  },
];

export default function DaftarMerchantPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "individual",
    ssmNumber: "",
    phone: "",
    address: "",
    tier: "STARTER",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
  });

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tier");
    if (t && ["STARTER", "PRO", "BUSINESS"].includes(t.toUpperCase())) {
      setForm((f) => ({ ...f, tier: t.toUpperCase() }));
    }
  }, []);

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (s: number): string | null => {
    if (s === 0) {
      if (!form.name.trim()) return "Nama penuh diperlukan.";
      if (!form.email.includes("@")) return "Email tidak sah.";
      if (!form.businessName.trim()) return "Nama bisnes diperlukan.";
      if (!form.phone.trim()) return "No. telefon diperlukan.";
    }
    if (s === 2) {
      if (!form.bankName.trim()) return "Nama bank diperlukan.";
      if (!form.bankAccount.trim()) return "No. akaun bank diperlukan.";
      if (form.password.length < 8) return "Kata laluan minimum 8 aksara.";
    }
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
    const err = validate(2);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ssmNumber: form.ssmNumber || undefined,
          address: form.address || undefined,
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

      router.push("/merchant/dashboard");
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
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Store className="h-3.5 w-3.5" /> Pendaftaran Merchant
          </span>
          <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
            Mula jual di <span className="text-gradient">BarangViral</span>
          </h1>
          <p className="mt-2 text-sm text-textsec">
            3 langkah sahaja — 100% profit jualan milik anda.
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
                  <h2 className="font-heading text-lg font-bold">Info Bisnes</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field icon={User} label="Nama Penuh" value={form.name} onChange={update("name")} placeholder="Nama anda" />
                    <Field icon={Phone} label="No. Telefon" value={form.phone} onChange={update("phone")} placeholder="01X-XXXXXXX" />
                  </div>
                  <Field icon={Mail} label="Email" type="email" value={form.email} onChange={update("email")} placeholder="anda@contoh.com" />
                  <Field icon={Store} label="Nama Bisnes" value={form.businessName} onChange={update("businessName")} placeholder="cth: Kedai Alia" />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Jenis Bisnes</label>
                    <select
                      value={form.businessType}
                      onChange={update("businessType")}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    >
                      <option value="individual">Individu</option>
                      <option value="sdn_bhd">Sdn Bhd</option>
                    </select>
                  </div>
                  {form.businessType === "sdn_bhd" && (
                    <Field icon={BadgeCheck} label="No. SSM (pilihan)" value={form.ssmNumber} onChange={update("ssmNumber")} placeholder="202301234567" />
                  )}
                  <Field icon={Landmark} label="Alamat (pilihan)" value={form.address} onChange={update("address")} placeholder="Alamat perniagaan" />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-bold">Pilih Tier Langganan</h2>
                  <p className="text-xs text-textsec">
                    Boleh naik taraf bila-bila masa. Yuran bulanan, tiada potongan jualan.
                  </p>
                  <div className="space-y-3">
                    {tiers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, tier: t.id }))}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                          form.tier === t.id
                            ? "border-transparent bg-gradient-to-r from-orange-50 to-pink-50 ring-2 ring-primary"
                            : "border-gray-200 hover:border-primary"
                        )}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <t.icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="font-heading font-bold">{t.name}</span>
                            {t.popular && (
                              <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold text-white">
                                POPULAR
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-textsec">{t.desc} • {t.products}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-heading text-lg font-extrabold text-primary">
                            RM{t.price}
                          </span>
                          <span className="text-[10px] text-textsec">/bulan</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-bold">Bank & Akaun</h2>
                  <p className="text-xs text-textsec">
                    Untuk pembayaran hasil jualan anda. Pastikan nama sepadan.
                  </p>
                  <Field icon={Landmark} label="Nama Bank" value={form.bankName} onChange={update("bankName")} placeholder="cth: Maybank" />
                  <Field icon={Landmark} label="No. Akaun" value={form.bankAccount} onChange={update("bankAccount")} placeholder="1234567890" />
                  <Field icon={User} label="Nama Pemegang Akaun" value={form.bankHolder} onChange={update("bankHolder")} placeholder="Nama pada akaun bank" />
                  <Field icon={Lock} label="Kata Laluan" type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 aksara" />
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

        <p className="mt-6 text-center text-xs text-textsec">
          Dengan mendaftar, anda bersetuju dengan Terma Perkhidmatan dan Dasar Privasi kami.
        </p>
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
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary"
        />
      </div>
    </div>
  );
}
