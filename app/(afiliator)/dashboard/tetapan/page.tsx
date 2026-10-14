"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  Wallet,
  Settings,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/dashboard", label: "Ikhtisar", icon: LayoutDashboard },
  { href: "/dashboard/link", label: "Link Afiliasi", icon: Link2 },
  { href: "/dashboard/promosi", label: "Promosi", icon: Megaphone },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: Settings },
];

export default function TetapanPage() {
  const [active] = useState("/dashboard/tetapan");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "Ahmad Afiliator",
    username: "ahmadviral",
    tiktok: "@ahmadviral",
    instagram: "@ahmad.my",
    youtube: "",
    bankName: "Maybank",
    bankAccount: "1234-5678-9012",
    email: "ahmad@contoh.com",
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-bgalt py-8 md:py-10">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-4 shadow-soft lg:sticky lg:top-24">
            <nav className="space-y-1">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    active === m.href
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-gray-600 hover:bg-bgalt"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
              <span className="text-gradient">Tetapan</span> Akaun
            </h1>

            <form onSubmit={submit} className="space-y-6">
              {/* Profil */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
                <h2 className="font-heading text-lg font-bold">Profil Afiliator</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Nama</label>
                    <input
                      value={form.name}
                      onChange={update("name")}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textsec">@</span>
                      <input
                        value={form.username}
                        onChange={update("username")}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-8 pr-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Media sosial */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
                <h2 className="font-heading text-lg font-bold">Media Sosial</h2>
                <p className="mt-1 text-xs text-textsec">
                  Untuk pengesahan afiliator dan komunikasi jenama.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    { key: "tiktok" as const, label: "TikTok", placeholder: "@username" },
                    { key: "instagram" as const, label: "Instagram", placeholder: "@username" },
                    { key: "youtube" as const, label: "YouTube", placeholder: "URL channel" },
                  ].map((s) => (
                    <div key={s.key}>
                      <label className="mb-1.5 block text-sm font-semibold">{s.label}</label>
                      <input
                        value={form[s.key] ?? ""}
                        onChange={update(s.key)}
                        placeholder={s.placeholder}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none placeholder:text-textsec focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pembayaran */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                  Butiran Pembayaran
                </h2>
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Pastikan nama bank sepadan dengan nama akaun untuk mengelak kelewatan pembayaran.
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Nama Bank</label>
                    <input
                      value={form.bankName}
                      onChange={update("bankName")}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">No. Akaun</label>
                    <input
                      value={form.bankAccount}
                      onChange={update("bankAccount")}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full sm:w-auto">
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Disimpan!" : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
