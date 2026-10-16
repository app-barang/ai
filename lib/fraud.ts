// ============================================================
// lib/fraud.ts — Pengesanan fraud asas (anti-klik palsu)
// ============================================================
import prisma from "@/lib/prisma";

const BOT_UA = /bot|crawl|spider|curl|wget|python|headless|phantom|selenium|puppeteer/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true; // UA kosong = syak bot
  return BOT_UA.test(ua);
}

export function fingerprint(ip: string, ua: string | null | undefined): string {
  const raw = `${ip}::${ua ?? ""}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  return `fp_${(h >>> 0).toString(16)}`;
}

/** Klik diri sendiri: afiliator klik produk merchant yang sama IP berulang */
export async function selfClickCount(affiliateId: string, ip: string): Promise<number> {
  const since = new Date(Date.now() - 3600_000); // 1 jam
  return prisma.click.count({
    where: { affiliateId, ipAddress: ip, createdAt: { gte: since } },
  });
}

/** Duplikasi IP tinggi (syak click farm) */
export async function ipBurstCount(ip: string): Promise<number> {
  const since = new Date(Date.now() - 60_000); // 1 minit
  return prisma.click.count({ where: { ipAddress: ip, createdAt: { gte: since } } });
}

export async function logFraud(params: {
  affiliateId?: string;
  merchantId?: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  action: "FLAGGED" | "BLOCKED" | "SUSPENDED";
}) {
  try {
    await prisma.fraudLog.create({
      data: {
        affiliateId: params.affiliateId ?? null,
        merchantId: params.merchantId ?? null,
        type: params.type,
        severity: params.severity,
        details: params.details as never,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        action: params.action,
      },
    });
  } catch (e) {
    console.error("[FraudLog]", (e as Error).message);
  }
}

export interface ClickVerdict {
  valid: boolean;
  reason?: string;
}

/** Penilaian penuh sebelum simpan klik */
export async function evaluateClick(params: {
  affiliateId: string;
  ip: string;
  userAgent?: string | null;
}): Promise<ClickVerdict> {
  if (isBotUserAgent(params.userAgent)) {
    await logFraud({
      affiliateId: params.affiliateId,
      type: "BOT_CLICK",
      severity: "MEDIUM",
      details: { userAgent: params.userAgent },
      ipAddress: params.ip,
      userAgent: params.userAgent ?? undefined,
      action: "FLAGGED",
    });
    return { valid: false, reason: "BOT_CLICK" };
  }

  const burst = await ipBurstCount(params.ip);
  if (burst >= 5) {
    await logFraud({
      affiliateId: params.affiliateId,
      type: "RATE_LIMIT",
      severity: "HIGH",
      details: { burst },
      ipAddress: params.ip,
      action: "BLOCKED",
    });
    return { valid: false, reason: "IP_BURST" };
  }

  const self = await selfClickCount(params.affiliateId, params.ip);
  if (self >= 10) {
    await logFraud({
      affiliateId: params.affiliateId,
      type: "SELF_CLICK",
      severity: "HIGH",
      details: { count: self },
      ipAddress: params.ip,
      action: "FLAGGED",
    });
    return { valid: false, reason: "SELF_CLICK" };
  }

  return { valid: true };
}
