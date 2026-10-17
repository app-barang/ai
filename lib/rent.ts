// ============================================================
// lib/rent.ts — Agihan Bonus Sewa (Rent Reward) 3 level
// Sumber: Rent Pool sahaja (30% STARTER / 25% PRO / 20% BUSINESS)
// ============================================================
import type { Prisma } from "@prisma/client";
import { RENT_LEVEL_SPLIT, rentRewardSplits, round4 } from "@/lib/bonus";

export interface RentDistribution {
  total: number;
  levels: { level: number; affiliateId: string; amount: number }[];
}

/**
 * Agih Bonus Sewa kepada rantaian afiliator yang membawa merchant.
 * L1 60%, L2 30%, L3 10% — dikira dari rentPoolAmount, BUKAN harga langganan.
 * Mesti dipanggil dalam transaksi yang sama dengan pengaktifan langganan.
 */
export async function distributeRentRewards(
  tx: Prisma.TransactionClient,
  input: {
    merchantId: string;
    subscriptionId: string;
    rentPoolAmount: number;
  }
): Promise<RentDistribution> {
  if (input.rentPoolAmount <= 0) return { total: 0, levels: [] };

  const referral = await tx.merchantReferral.findFirst({
    where: { merchantId: input.merchantId },
    orderBy: { createdAt: "asc" },
    include: {
      merchant: { select: { businessName: true } },
      affiliate: {
        include: { upline: { include: { upline: true } } },
      },
    },
  });

  // Tiada afiliator yang membawa merchant — dana kekal dalam Rent Pool
  if (!referral) return { total: 0, levels: [] };

  const chain = [
    referral.affiliate,
    referral.affiliate.upline,
    referral.affiliate.upline?.upline,
  ] as const;

  const amounts = rentRewardSplits(input.rentPoolAmount);
  const levels: RentDistribution["levels"] = [];
  let total = 0;

  for (let i = 0; i < chain.length; i++) {
    const target = chain[i];
    const amount = amounts[i] ?? 0;
    if (!target || amount <= 0) continue;

    await tx.earning.create({
      data: {
        affiliateId: target.id,
        type: "RENT_REWARD",
        level: i + 1,
        sourceType: "RENT",
        sourceId: input.subscriptionId,
        grossAmount: input.rentPoolAmount,
        percentage: RENT_LEVEL_SPLIT[i],
        netAmount: amount,
        description: `Bonus sewa L${i + 1} — ${referral.merchant.businessName}`,
        status: "PENDING",
      },
    });

    await tx.affiliate.update({
      where: { id: target.id },
      data: {
        balance: { increment: amount },
        pendingBalance: { increment: amount },
        totalEarnings: { increment: amount },
        // Kira merchant pertama sahaja untuk statistik "totalMerchants"
        ...(i === 0 && referral.monthsActive === 0
          ? { totalMerchants: { increment: 1 } }
          : {}),
      },
    });

    levels.push({ level: i + 1, affiliateId: target.id, amount });
    total = round4(total + amount);
  }

  await tx.merchantReferral.update({
    where: { id: referral.id },
    data: {
      totalEarned: { increment: total },
      monthsActive: { increment: 1 },
    },
  });

  return { total, levels };
}
