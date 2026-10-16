// ============================================================
// lib/tracking.ts — Enjin click-tracking + agihan bonus 3-tier
// ============================================================
import prisma, { withDbRetry } from "@/lib/prisma";
import { evaluateClick } from "@/lib/fraud";
import { getOrCreatePool } from "@/lib/pool";
import {
  CLICK_LEVEL_SPLIT,
  CAPS,
  monthPeriod,
  splitByLevels,
  tierRate,
  round4,
} from "@/lib/bonus";
import { generateShortCode } from "@/lib/utils";

export interface ProcessClickInput {
  affiliateUsername: string;
  productId: string;
  ip: string;
  userAgent?: string | null;
  referrer?: string | null;
}

export interface ProcessClickResult {
  valid: boolean;
  reason?: string;
  shortCode: string;
  redirectUrl: string;
  reward: number;
  levels: { level: number; affiliateId: string; amount: number }[];
}

/** Kira jumlah bonus klik bulanan semasa untuk seorang afiliator */
async function monthlyClickEarnings(affiliateId: string, period: string): Promise<number> {
  const where = {
    affiliateId,
    type: "CLICK_REWARD" as const,
    createdAt: { gte: new Date(`${period}-01T00:00:00.000Z`) },
  };
  const agg = await prisma.earning.aggregate({
    where,
    _sum: { netAmount: true },
  });
  return agg._sum.netAmount ?? 0;
}

export async function processClick(input: ProcessClickInput): Promise<ProcessClickResult> {
  const [affiliate, product] = await Promise.all([
    withDbRetry(() =>
      prisma.affiliate.findUnique({
        where: { username: input.affiliateUsername },
        include: { upline: { include: { upline: true } } },
      })
    ),
    withDbRetry(() =>
      prisma.product.findUnique({ where: { id: input.productId } })
    ),
  ]);

  if (!affiliate) {
    throw new Error("Afiliator tidak dijumpai");
  }
  if (!product) {
    throw new Error("Produk tidak dijumpai");
  }

  const shortCode = generateShortCode();
  const verdict = await evaluateClick({
    affiliateId: affiliate.id,
    ip: input.ip,
    userAgent: input.userAgent,
  });

  const click = await withDbRetry(() =>
    prisma.click.create({
      data: {
        affiliateId: affiliate.id,
        productId: product.id,
        merchantId: product.merchantId,
        shortCode,
        ipAddress: input.ip,
        userAgent: input.userAgent ?? null,
        referrer: input.referrer ?? null,
        isValid: verdict.valid,
        flagReason: verdict.reason ?? null,
      },
    })
  );

  const redirectUrl = `/produk/${product.slug}`;

  if (!verdict.valid) {
    return {
      valid: false,
      reason: verdict.reason,
      shortCode,
      redirectUrl,
      reward: 0,
      levels: [],
    };
  }

  const period = monthPeriod();
  const pool = await getOrCreatePool("CLICK_POOL", period);

  // Semak cap bulanan afiliator (L1)
  const earned = await monthlyClickEarnings(affiliate.id, period);
  if (earned >= CAPS.CLICK_REWARD) {
    return { valid: true, reason: "CAP_REACHED", shortCode, redirectUrl, reward: 0, levels: [] };
  }

  // Kadar klik ikut tier afiliator; tidak melebihi baki pool
  let total = tierRate(affiliate.tier);
  if (pool.remaining <= 0) total = 0;
  else total = Math.min(total, pool.remaining);
  total = round4(total);

  // Cap baki bulanan
  const room = Math.max(0, CAPS.CLICK_REWARD - earned);
  total = Math.min(total, room);
  total = round4(total);

  const splits = splitByLevels(total, CLICK_LEVEL_SPLIT);
  const chain = [affiliate, affiliate.upline, affiliate.upline?.upline] as const;

  const levels: { level: number; affiliateId: string; amount: number }[] = [];
  const ops: unknown[] = [];

  for (let i = 0; i < chain.length; i++) {
    const target = chain[i];
    if (!target) break;
    const amount = splits[i] ?? 0;
    levels.push({ level: i + 1, affiliateId: target.id, amount });

    ops.push(
      prisma.earning.create({
        data: {
          affiliateId: target.id,
          type: "CLICK_REWARD",
          level: i + 1,
          sourceType: "CLICK",
          sourceId: click.id,
          grossAmount: total,
          percentage: CLICK_LEVEL_SPLIT[i],
          netAmount: amount,
          description: `Bonus klik L${i + 1} — ${product.name}`,
          status: "PENDING",
        },
      }),
      prisma.affiliate.update({
        where: { id: target.id },
        data: {
          balance: { increment: amount },
          pendingBalance: { increment: amount },
          totalEarnings: { increment: amount },
          ...(i === 0 ? { totalClicks: { increment: 1 } } : {}),
        },
      })
    );
  }

  // Satu round-trip: earnings + affiliate + pool + merchant + product
  ops.push(
    prisma.rewardPool.update({
      where: { id: pool.id },
      data: {
        totalClicks: { increment: 1 },
        allocated: { increment: total },
        remaining: { decrement: total },
      },
    }),
    prisma.merchant.update({
      where: { id: product.merchantId },
      data: { totalClicks: { increment: 1 } },
    }),
    prisma.product.update({
      where: { id: product.id },
      data: { clicks: { increment: 1 } },
    })
  );

  await withDbRetry(() => prisma.$transaction(ops as never[]));

  return {
    valid: true,
    shortCode,
    redirectUrl,
    reward: total,
    levels,
  };
}
