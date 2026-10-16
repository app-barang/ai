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

/** Klik diri sendiri + burst IP — SATU round-trip (2 subquery) */
export async function clickCounts(
  affiliateId: string,
  ip: string
): Promise<{ burst: number; self: number }> {
  const since1 = new Date(Date.now() - 60_000);
  const since60 = new Date(Date.now() - 3600_000);
  const rows = await prisma.$queryRaw<{ burst: bigint; self: bigint }[]>`
    SELECT
      (SELECT count(*) FROM clicks WHERE "ipAddress" = ${ip} AND "createdAt" >= ${since1}) AS burst,
      (SELECT count(*) FROM clicks WHERE "affiliateId" = ${affiliateId} AND "ipAddress" = ${ip} AND "createdAt" >= ${since60}) AS self
  `;
  const r = rows[0];
  return { burst: Number(r?.burst ?? 0), self: Number(r?.self ?? 0) };
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

  const { burst, self } = await clickCounts(params.affiliateId, params.ip);

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
