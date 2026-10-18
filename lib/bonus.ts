// ============================================================
// lib/bonus.ts — Enjin bonus berbilang tingkat (SAH, 3 level)
// Semua bonus datang dari PLATFORM, bukan dari bayaran downline.
// ============================================================
import type { AffiliateTier, MerchantTier } from "@prisma/client";

// ---------- Split langganan merchant ----------
export const SUBSCRIPTION_SPLIT: Record<
  MerchantTier,
  { price: number; platform: number; rentPool: number; floating: number }
> = {
  STARTER: { price: 30, platform: 0.4, rentPool: 0.3, floating: 0.3 },
  PRO: { price: 99, platform: 0.5, rentPool: 0.25, floating: 0.25 },
  BUSINESS: { price: 199, platform: 0.6, rentPool: 0.2, floating: 0.2 },
};

export function splitSubscription(tier: MerchantTier) {
  const cfg = SUBSCRIPTION_SPLIT[tier];
  return {
    amount: cfg.price,
    platformShare: round2(cfg.price * cfg.platform),
    rentPoolShare: round2(cfg.price * cfg.rentPool),
    floatingShare: round2(cfg.price * cfg.floating),
  };
}

// ---------- Agihan bonus ikut level ----------
// Bonus Klik: 60% (L1/klik sendiri), 25% (L2/downline direct), 15% (L3/downline L2)
export const CLICK_LEVEL_SPLIT = [0.6, 0.25, 0.15];
// Bonus Sewa: 60% (yang bawa merchant), 30% (upline direct), 10% (upline L2)
export const RENT_LEVEL_SPLIT = [0.6, 0.3, 0.1];

export const CAPS = {
  CLICK_REWARD: 500, // RM/bulan
  RENT_REWARD: 2000, // RM/bulan
};

/** Had bilangan produk mengikut tier langganan */
export const PRODUCT_LIMITS: Record<MerchantTier, number> = {
  STARTER: 5,
  PRO: 20,
  BUSINESS: Infinity,
};

// ---------- Tier afiliator ----------
export const AFFILIATE_TIERS: Record<
  AffiliateTier,
  { minClicks: number; minSales: number; ratePerClick: number }
> = {
  BRONZE: { minClicks: 100, minSales: 0, ratePerClick: 0.005 },
  SILVER: { minClicks: 500, minSales: 3, ratePerClick: 0.01 },
  GOLD: { minClicks: 2000, minSales: 10, ratePerClick: 0.02 },
  DIAMOND: { minClicks: 5000, minSales: 30, ratePerClick: 0.03 },
  ELITE: { minClicks: 10000, minSales: 100, ratePerClick: 0.05 },
};

const TIER_ORDER: AffiliateTier[] = ["BRONZE", "SILVER", "GOLD", "DIAMOND", "ELITE"];

export function affiliateTierFor(clicks: number, sales: number): AffiliateTier {
  let tier: AffiliateTier = "BRONZE";
  for (const t of TIER_ORDER) {
    const c = AFFILIATE_TIERS[t];
    if (clicks >= c.minClicks && sales >= c.minSales) tier = t;
  }
  return tier;
}

export function tierRate(tier: AffiliateTier): number {
  return AFFILIATE_TIERS[tier].ratePerClick;
}

// ---------- Utiliti ----------
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Ketepatan 4 dp — perlu untuk bonus klik kecil (RM0.005–0.05) */
export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function monthPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Bahagikan amaun ikut peratus level.
 * Pulangkan array amaun per level (bulat 2 dp). Baki pembundaran
 * diberi kepada level 1 supaya jumlah kekal tepat.
 */
export function splitByLevels(amount: number, splits: number[]): number[] {
  const out = splits.map((s) => round4(amount * s));
  const diff = round4(amount - out.reduce((a, b) => a + b, 0));
  if (out.length > 0) out[0] = round4(out[0] + diff);
  return out;
}

/**
 * Amaun Rent Pool untuk satu tier langganan.
 * Bonus Sewa HANYA diambil dari bahagian ini — bukan harga penuh langganan.
 * Contoh STARTER RM30 × 30% = RM9.00.
 */
export function rentPoolAmount(tier: MerchantTier): number {
  return splitSubscription(tier).rentPoolShare;
}

/** Bahagi Rent Pool ikut 60/30/10 (L1/L2/L3). */
export function rentRewardSplits(rentPool: number): number[] {
  return splitByLevels(rentPool, RENT_LEVEL_SPLIT);
}

// ---------- Komisen jualan (Closed-Loop CHIP) ----------
export const SALE_PLATFORM_FEE_RATE = 0.1; // 10% hanya jika ada afiliator
export const SALE_AFFILIATE_RATE = 0.3; // 30% dari platform fee

/**
 * Kira split jualan:
 * - Tanpa afiliator: platformFee 0, merchant 100%.
 * - Dengan afiliator: platformFee 10%, merchant 90%, afiliator 30% dari fee.
 */
export function saleCommissionSplit(totalAmount: number, withAffiliate: boolean) {
  const total = round2(totalAmount);
  const platformFee = withAffiliate ? round2(total * SALE_PLATFORM_FEE_RATE) : 0;
  const merchantNet = round2(total - platformFee);
  const affiliateCommission = withAffiliate ? round2(platformFee * SALE_AFFILIATE_RATE) : 0;
  return { platformFee, merchantNet, affiliateCommission };
}

/** Kadar klik dinamik: Fund ÷ Total Klik, di-clamp min/max */
export function clickRate(fund: number, totalClicks: number, min = 0.005, max = 0.05): number {
  if (totalClicks <= 0) return min;
  const rate = fund / totalClicks;
  return Math.min(max, Math.max(min, round4(rate)));
}

/** Bonus Team Leader: RM100–2,000 ikut saiz team */
export function teamBonus(teamSize: number): number {
  if (teamSize < 5) return 0;
  if (teamSize >= 30) return 2000;
  return Math.min(2000, 100 + (teamSize - 5) * 50);
}
