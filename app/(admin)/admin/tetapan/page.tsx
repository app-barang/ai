"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, KeyRound, Loader2, AlertCircle, Check, Save, Mail, User } from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<{ name: string | null; email: string; role: string; createdAt: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setProfile(d.admin))
      .catch(() => setError("Gagal memuatkan profil admin."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Kata laluan baharu minimum 8 aksara.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Pengesahan kata laluan tidak sepadan.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Gagal mengemas kini kata laluan.");
        return;
      }
      setSuccess(d.message ?? "Kata laluan dikemas kini.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setSaving(false);
    }
  };

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
          Tetapan <span className="text-gradient">Pentadbir</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">Urus profil dan keselamatan akaun admin.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-success">
          <Check className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <ShieldCheck className="h-5 w-5 text-primary" /> Profil
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-bgalt p-4">
            <p className="flex items-center gap-1.5 text-xs text-textsec">
              <User className="h-3.5 w-3.5" /> Nama
            </p>
            <p className="mt-1 text-sm font-bold">{profile?.name ?? "-"}</p>
          </div>
          <div className="rounded-2xl bg-bgalt p-4">
            <p className="flex items-center gap-1.5 text-xs text-textsec">
              <Mail className="h-3.5 w-3.5" /> Email
            </p>
            <p className="mt-1 truncate text-sm font-bold">{profile?.email ?? "-"}</p>
          </div>
          <div className="rounded-2xl bg-bgalt p-4">
            <p className="text-xs text-textsec">Peranan</p>
            <p className="mt-1 text-sm font-bold text-primary">{profile?.role ?? "-"}</p>
          </div>
          <div className="rounded-2xl bg-bgalt p-4">
            <p className="text-xs text-textsec">Akaun dicipta</p>
            <p className="mt-1 text-sm font-bold">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("ms-MY") : "-"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <KeyRound className="h-5 w-5 text-primary" /> Tukar Kata Laluan
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">Kata Laluan Semasa</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Kata Laluan Baharu</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 aksara"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Sahkan Kata Laluan</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulang kata laluan baharu"
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary mt-5 sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Menyimpan..." : "Kemas Kini Kata Laluan"}
        </button>
        <p className="mt-3 text-xs text-textsec">
          Gunakan kata laluan kuat (huruf besar, kecil, nombor & simbol). Anda kekal log masuk selepas perubahan.
        </p>
      </form>
    </div>
  );
}
