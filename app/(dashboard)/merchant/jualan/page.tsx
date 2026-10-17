"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, Loader2, AlertCircle, Wallet } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  merchantNet: number;
  status: string;
  customerName: string;
  paymentMethod: string | null;
  createdAt: string;
  product: { name: string; slug: string } | null;
}

interface OrdersData {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
  summary: { byStatus: Record<string, number>; totalRevenue: number; totalNet: number };
}

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-success/10 text-success",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-gray-100 text-gray-500",
  REFUNDED: "bg-red-100 text-red-600",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dihantar",
  DELIVERED: "Diterima",
  CANCELLED: "Batal",
  REFUNDED: "Dikembalikan",
};

const filters = ["", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function MerchantOrdersPage() {
  const [data, setData] = useState<OrdersData | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) qs.set("status", status);
      const res = await fetch(`/api/merchant/orders?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Gagal memuatkan pesanan.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">
          Pesanan <span className="text-gradient">Jualan</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">Semua pesanan untuk produk anda.</p>
      </div>

      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-soft">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <p className="mt-3 font-heading text-3xl font-extrabold">{data.pagination.total}</p>
            <p className="text-sm font-semibold">Jumlah Pesanan</p>
          </div>
          <div className="card-soft">
            <Wallet className="h-6 w-6 text-success" />
            <p className="mt-3 font-heading text-3xl font-extrabold">
              {formatPrice(data.summary.totalRevenue)}
            </p>
            <p className="text-sm font-semibold">Hasil (dibayar)</p>
          </div>
          <div className="card-soft">
            <Wallet className="h-6 w-6 text-viral-pink" />
            <p className="mt-3 font-heading text-3xl font-extrabold">
              {formatPrice(data.summary.totalNet)}
            </p>
            <p className="text-sm font-semibold">Bersih Merchant</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f || "ALL"}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={
              status === f
                ? "rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow"
                : "rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-primary"
            }
          >
            {f ? statusLabel[f] : "Semua"}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-soft">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-sm text-textsec">Memuatkan pesanan...</p>
        </div>
      ) : !data || data.orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-textsec" />
          <p className="mt-3 font-semibold">Belum ada pesanan</p>
          <p className="text-sm text-textsec">Pesanan akan muncul di sini selepas pembeli membayar.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-bgalt">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-textsec">
                    <th className="px-4 py-3">No. Pesanan</th>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Pembeli</th>
                    <th className="px-4 py-3 text-right">Jumlah</th>
                    <th className="px-4 py-3 text-right">Bersih</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Tarikh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-bgalt/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{o.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{o.product?.name ?? "-"}</p>
                        <p className="text-xs text-textsec">x{o.quantity}</p>
                      </td>
                      <td className="px-4 py-3">{o.customerName}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatPrice(o.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-success">
                        {formatPrice(o.merchantNet)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColor[o.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {statusLabel[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-textsec">
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-textsec">
                Halaman {data.pagination.page} / {data.pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  Sebelum
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                  disabled={page >= data.pagination.pages}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  Seterusnya
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
