// ============================================================
// lib/pool.ts — Pengurusan Reward Pool (Click / Rent / Team)
// ============================================================
import prisma, { withDbRetry } from "@/lib/prisma";
import type { PoolType } from "@prisma/client";
import { monthPeriod } from "@/lib/bonus";

export async function getOrCreatePool(type: PoolType, period = monthPeriod()) {
  return withDbRetry(() =>
    prisma.rewardPool.upsert({
      where: { type_period: { type, period } },
      update: {},
      create: { type, period, totalFund: 0, remaining: 0, currentRate: 0.01 },
    })
  );
}

/** Tambah dana ke pool (dari split langganan merchant) */
export async function addFund(type: PoolType, amount: number, period = monthPeriod()) {
  return withDbRetry(async () => {
    const pool = await getOrCreatePool(type, period);
    return prisma.rewardPool.update({
      where: { id: pool.id },
      data: {
        totalFund: { increment: amount },
        remaining: { increment: amount },
      },
    });
  });
}

/** Kira semula kadar klik dinamik & simpan */
export async function recomputeClickRate(period = monthPeriod()) {
  return withDbRetry(async () => {
    const pool = await getOrCreatePool("CLICK_POOL", period);
    const rate =
      pool.totalClicks > 0
        ? Math.min(pool.maxRate, Math.max(pool.minRate, pool.totalFund / pool.totalClicks))
        : pool.minRate;
    return prisma.rewardPool.update({
      where: { id: pool.id },
      data: { currentRate: Math.round(rate * 1000) / 1000 },
    });
  });
}

/** Tambah kiraan klik + dana digunakan */
export async function registerClickInPool(
  amountUsed: number,
  addClicks = 1,
  period = monthPeriod()
) {
  return withDbRetry(() =>
    prisma.rewardPool.update({
      where: { type_period: { type: "CLICK_POOL", period } },
      data: {
        totalClicks: { increment: addClicks },
        allocated: { increment: amountUsed },
        remaining: { decrement: amountUsed },
      },
    })
  );
}

export async function poolSummary() {
  return withDbRetry(() =>
    prisma.rewardPool.findMany({ orderBy: [{ period: "desc" }, { type: "asc" }] })
  );
}
