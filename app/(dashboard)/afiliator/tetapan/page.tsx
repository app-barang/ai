"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Check, Save, User, Landmark, Smartphone } from "lucide-react";

export default function AffiliateSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    tiktok: "",
    instagram: "",
    youtube: "",
    facebook: "",
    followers: "",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate/settings", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        const a = d.affiliate;
        setForm({
          name: a.user?.name ?? "",
          username: a.username ?? "",
          tiktok: a.tiktok ?? "",
          instagram: a.instagram ?? "",
          youtube: a.youtube ?? "",
          facebook: a.facebook ?? "",
          followers: a.followers ? String(a.followers) : "",
          bankName: a.bankName ?? "",
          bankAccount: a.bankAccount ?? "",
          bankHolder: a.bankHolder ?? "",
        });
      })
      .catch(() => setError("Gagal memuatkan tetapan."))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/affiliate/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          followers: form.followers ? Number(form.followers) : null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Gagal menyimpan.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    opts: { type?: string; placeholder?: string; disabled?: boolean } = {}
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input
        type={opts.type ?? "text"}
        value={form[key]}
        disabled={opts.disabled}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={opts.placeholder}
        className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary disabled:opacity-60"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-textsec shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuatkan tetapan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          Tetapan <span className="text-gradient">Afiliator</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">Kemas kini profil, media sosial dan bank anda.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-success">
          <Check className="h-4 w-4" /> Tetapan disimpan.
        </div>
      )}

      <form onSubmit={save} className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <User className="h-5 w-5 text-primary" /> Profil
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field("Nama", "name")}
            {field("Username", "username", { disabled: true })}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Smartphone className="h-5 w-5 text-primary" /> Media Sosial
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field("TikTok", "tiktok", { placeholder: "@username" })}
            {field("Instagram", "instagram", { placeholder: "@username" })}
            {field("YouTube", "youtube", { placeholder: "URL channel" })}
            {field("Facebook", "facebook", { placeholder: "URL profil" })}
            {field("Jumlah Followers", "followers", { type: "number", placeholder: "10000" })}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Landmark className="h-5 w-5 text-primary" /> Maklumat Bank
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field("Nama Bank", "bankName", { placeholder: "cth: Maybank" })}
            {field("No. Akaun", "bankAccount", { placeholder: "1234567890" })}
            <div className="sm:col-span-2">
              {field("Nama Pemegang Akaun", "bankHolder", { placeholder: "Nama pada akaun bank" })}
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
