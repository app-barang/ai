// ============================================================
// lib/chip.ts — Klien CHIP (Chip-in.asia) Payment Gateway
// ============================================================
import prisma, { withDbRetry } from "@/lib/prisma";

export function chipBaseUrl(): string {
  // CHIP guna host sama untuk sandbox & produksi —
  // mod ditentukan oleh secret key. Hormati CHIP_BASE_URL.
  return process.env.CHIP_BASE_URL || "https://gate.chip-in.asia/api/v1";
}

export function hasChip(): boolean {
  return !!process.env.CHIP_SECRET_KEY && process.env.CHIP_SECRET_KEY.length > 20;
}

async function chipFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${chipBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.CHIP_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const detail =
      (data as { message?: string })?.message ||
      (data as { error?: string })?.error ||
      (typeof data === "object" && data !== null
        ? JSON.stringify(data).slice(0, 300)
        : String(data).slice(0, 300));
    throw new Error(`CHIP ${res.status}: ${detail}`);
  }
  return data as T;
}

export interface ChipPurchase {
  id: string;
  status: string;
  checkout_url?: string;
  purchase?: { total?: number; currency?: string };
  created_on?: number;
  [k: string]: unknown;
}

export async function createChipPurchase(params: {
  amountRM: number; // dalam Ringgit
  description: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  successRedirect: string;
  failureRedirect: string;
  successCallback: string;
  metadata?: Record<string, unknown>;
}): Promise<ChipPurchase> {
  const body = {
    client: {
      email: params.clientEmail,
      full_name: params.clientName,
      phone: params.clientPhone ?? "+60123456789",
    },
    purchase: {
      currency: "MYR",
      products: [
        {
          name: params.description.slice(0, 250),
          price: Math.round(params.amountRM * 100), // sen
        },
      ],
      language: "en",
      send_receipt: true,
      success_redirect: params.successRedirect,
      failure_redirect: params.failureRedirect,
      success_callback: params.successCallback,
      metadata: params.metadata ?? {},
    },
    brand_id: process.env.CHIP_BRAND_ID,
  };

  return chipFetch<ChipPurchase>("/purchases/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getChipPurchase(id: string): Promise<ChipPurchase> {
  return chipFetch<ChipPurchase>(`/purchases/${id}/`, { method: "GET" });
}

/** Simpan pemetaan purchaseId → jenis pembayaran (guna AICache; tiada migrasi) */
export async function savePaymentRef(
  purchaseId: string,
  data: Record<string, unknown>
): Promise<void> {
  await withDbRetry(() =>
    prisma.aICache.upsert({
      where: { key: `pay:${purchaseId}` },
      update: { value: data as never, expiresAt: new Date(Date.now() + 7 * 864e5) },
      create: {
        key: `pay:${purchaseId}`,
        value: data as never,
        expiresAt: new Date(Date.now() + 7 * 864e5),
      },
    })
  );
}

export async function getPaymentRef(
  purchaseId: string
): Promise<Record<string, unknown> | null> {
  const row = await withDbRetry(() =>
    prisma.aICache.findUnique({ where: { key: `pay:${purchaseId}` } })
  );
  return (row?.value as Record<string, unknown>) ?? null;
}
