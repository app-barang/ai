"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Package,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  sold: number;
  views: number;
  clicks: number;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  category: "",
  stock: "",
  image: "",
};

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [quota, setQuota] = useState<{ used?: number; limit?: number | string; tier?: string }>({});

  const load = useCallback(async () => {
    try {
      setError("");
      const [pRes, sRes] = await Promise.all([
        fetch("/api/merchant/products?all=true&limit=50", { cache: "no-store" }),
        fetch("/api/merchant/subscription", { cache: "no-store" }),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(data.items ?? []);
      } else {
        setError("Gagal memuatkan produk.");
      }
      if (sRes.ok) {
        const s = await sRes.json();
        setQuota({ used: s.history ? undefined : undefined, limit: s.quota?.productLimit, tier: s.quota?.tier });
      }
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setQuota((q) => ({ ...q, used: products.filter((p) => p.isActive).length }));
  }, [products]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError("");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      category: p.category,
      stock: String(p.stock),
      image: p.images?.[0] ?? "",
    });
    setShowForm(true);
    setError("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category.trim()) {
      setError("Nama, deskripsi, harga dan kategori diperlukan.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        category: form.category,
        stock: Number(form.stock) || 0,
        images: form.image ? [form.image] : [],
      };
      const res = await fetch(
        editing ? `/api/merchant/products/${editing.id}` : "/api/merchant/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan produk.");
        return;
      }
      setShowForm(false);
      setEditing(null);
      setForm({ ...emptyForm });
      await load();
    } catch {
      setError("Ralat sambungan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Nyahaktifkan produk "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/merchant/products/${p.id}`, { method: "DELETE" });
      if (res.ok) await load();
      else setError("Gagal menyahaktifkan produk.");
    } catch {
      setError("Ralat sambungan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
            Produk <span className="text-gradient">Saya</span>
          </h1>
          <p className="mt-1 text-sm text-textsec">
            {quota.used ?? products.filter((p) => p.isActive).length} digunakan
            {quota.limit ? ` / ${quota.limit}` : ""} {quota.tier ? `• tier ${quota.tier}` : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Tambah Produk
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">
              {editing ? "Kemas Kini Produk" : "Produk Baharu"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1.5 text-textsec hover:bg-bgalt"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">Nama Produk</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="cth: Smart Watch Fitness Band"
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Terangkan produk anda..."
                className="w-full rounded-xl border border-gray-200 bg-bgalt px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Harga (RM)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Harga Asal (pilihan)</label>
              <input
                type="number"
                step="0.01"
                value={form.comparePrice}
                onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Kategori</label>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="cth: Gajet"
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Stok</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">URL Gambar (pilihan)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="h-12 w-full rounded-xl border border-gray-200 bg-bgalt pl-11 pr-4 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary !py-2.5 text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-outline !py-2.5 text-sm"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Senarai */}
      {loading ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-soft">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-sm text-textsec">Memuatkan produk...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-textsec" />
          <p className="mt-3 font-semibold">Belum ada produk</p>
          <p className="text-sm text-textsec">Tambah produk pertama anda.</p>
          <button onClick={openCreate} className="btn-primary mt-4 !py-2.5 text-sm">
            <Plus className="h-4 w-4" /> Tambah Produk
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-bgalt">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-textsec">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right">Harga</th>
                  <th className="px-4 py-3 text-right">Stok</th>
                  <th className="px-4 py-3 text-right">Terjual</th>
                  <th className="px-4 py-3 text-right">Klik</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-bgalt/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-textsec">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-textsec">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-right">{p.sold}</td>
                    <td className="px-4 py-3 text-right">{p.clicks}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          p.isActive
                            ? "rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success"
                            : "rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500"
                        }
                      >
                        {p.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500"
                          aria-label="Padam"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
