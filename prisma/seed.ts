// ============================================================
// Seed v2 - barangviral.store (model bisnes baharu)
// Guna: npx tsx prisma/seed.ts
// ============================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed v2 bermula...");

  // ============ ADMIN ============
  const adminPass = await bcrypt.hash("Admin123456", 10);
  await prisma.user.upsert({
    where: { email: "admin@barangviral.store" },
    update: {},
    create: {
      email: "admin@barangviral.store",
      name: "Admin BarangViral",
      password: adminPass,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // ============ MERCHANT 1 (STARTER) ============
  const m1Pass = await bcrypt.hash("Merchant123456", 10);
  const m1User = await prisma.user.upsert({
    where: { email: "alia@merchant.com" },
    update: {},
    create: {
      email: "alia@merchant.com",
      name: "Alia Beauty",
      password: m1Pass,
      role: "MERCHANT",
      emailVerified: new Date(),
    },
  });
  const m1 = await prisma.merchant.upsert({
    where: { userId: m1User.id },
    update: {},
    create: {
      userId: m1User.id,
      businessName: "Kedai Beauty Alia",
      businessType: "individual",
      phone: "0123456789",
      tier: "STARTER",
      status: "ACTIVE",
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 864e5),
      bankName: "Maybank",
      bankAccount: "1234567890",
      bankHolder: "Alia Beauty",
    },
  });

  // ============ MERCHANT 2 (PRO) ============
  const m2Pass = await bcrypt.hash("Merchant123456", 10);
  const m2User = await prisma.user.upsert({
    where: { email: "tech@merchant.com" },
    update: {},
    create: {
      email: "tech@merchant.com",
      name: "TechGadget MY",
      password: m2Pass,
      role: "MERCHANT",
      emailVerified: new Date(),
    },
  });
  const m2 = await prisma.merchant.upsert({
    where: { userId: m2User.id },
    update: {},
    create: {
      userId: m2User.id,
      businessName: "TechGadget MY",
      businessType: "sdn_bhd",
      ssmNumber: "202301234567",
      phone: "0198887777",
      tier: "PRO",
      status: "ACTIVE",
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 864e5),
      bankName: "CIMB",
      bankAccount: "7012345678",
      bankHolder: "TechGadget Sdn Bhd",
    },
  });

  // ============ PRODUK ============
  const products = [
    { merchantId: m1.id, name: "Serum Vitamin C Brightening", slug: "serum-vitamin-c-brightening", price: 25.9, comparePrice: 59.9, category: "Kecantikan", stock: 620, rating: 4.9, sold: 220, isViral: true, viralScore: 96, viralTrend: "rising", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600", desc: "Serum Vitamin C 20% - cerahkan kulit, pudarkan jeragat." },
    { merchantId: m1.id, name: "LED Face Mask Therapy", slug: "led-face-mask-therapy", price: 49.9, comparePrice: 129.9, category: "Kecantikan", stock: 340, rating: 4.8, sold: 125, isViral: true, viralScore: 94, viralTrend: "rising", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600", desc: "Topeng muka LED 7 warna anti jerawat." },
    { merchantId: m1.id, name: "Moisturizer Aloe Vera", slug: "moisturizer-aloe-vera", price: 19.9, comparePrice: 39.9, category: "Kecantikan", stock: 400, rating: 4.6, sold: 88, isViral: false, viralScore: 72, viralTrend: "stable", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", desc: "Pelembap aloe vera untuk kulit kering." },
    { merchantId: m2.id, name: "TWS Earbuds Bass Pro", slug: "tws-earbuds-bass-pro", price: 45.9, comparePrice: 129.0, category: "Gajet", stock: 480, rating: 4.5, sold: 217, isViral: true, viralScore: 88, viralTrend: "rising", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600", desc: "Earbud wireless bass mendalam, battery 40jam." },
    { merchantId: m2.id, name: "Powerbank 20000mAh", slug: "powerbank-20000mah", price: 49.9, comparePrice: 99.0, category: "Gajet", stock: 310, rating: 4.7, sold: 134, isViral: true, viralScore: 89, viralTrend: "rising", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600", desc: "Powerbank 20000mAh fast charge 22.5W." },
    { merchantId: m2.id, name: "Keyboard RGB Mekanis 87", slug: "keyboard-rgb-mekanis", price: 79.9, comparePrice: 169.0, category: "Gajet", stock: 95, rating: 4.6, sold: 49, isViral: false, viralScore: 74, viralTrend: "stable", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", desc: "Keyboard RGB mekanis 87 kunci." },
  ];
  for (const p of products) {
    const { image, desc, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...rest, description: desc, images: [image] },
    });
  }

  // ============ AFILIATOR (hierarki 3 level) ============
  async function makeAffiliate(email: string, name: string, username: string, uplineId?: string) {
    const pass = await bcrypt.hash("Affiliate123456", 10);
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, password: pass, role: "AFFILIATE", emailVerified: new Date() },
    });
    return prisma.affiliate.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        username,
        uplineId: uplineId ?? null,
        tier: "BRONZE",
        status: "ACTIVE",
        tiktok: "@" + username,
        followers: 12000,
        bankName: "Maybank",
        bankAccount: "1111222233",
        bankHolder: name,
      },
    });
  }

  const affTop = await makeAffiliate("top@affiliate.com", "Top Leader", "topleader");
  const affMid = await makeAffiliate("mid@affiliate.com", "Mid Affiliate", "midviral", affTop.id);
  await makeAffiliate("leaf@affiliate.com", "Leaf Affiliate", "leafsmall", affMid.id);

  // Kira semula level counts
  await prisma.affiliate.update({ where: { id: affTop.id }, data: { level1Count: 1, level2Count: 1 } });
  await prisma.affiliate.update({ where: { id: affMid.id }, data: { level1Count: 1 } });

  // ============ MERCHANT REFERRAL (top bawa merchant1) ============
  await prisma.merchantReferral.upsert({
    where: { affiliateId_merchantId: { affiliateId: affTop.id, merchantId: m1.id } },
    update: {},
    create: { affiliateId: affTop.id, merchantId: m1.id, level: 1 },
  });

  // ============ REWARD POOLS (2026-10) ============
  const period = "2026-10";
  for (const [type, fund, rate] of [
    ["CLICK_POOL", 500, 0.01],
    ["RENT_POOL", 1500, 0],
    ["TEAM_POOL", 2000, 0],
  ] as const) {
    await prisma.rewardPool.upsert({
      where: { type_period: { type, period } },
      update: {},
      create: { type, period, totalFund: fund, remaining: fund, currentRate: rate },
    });
  }

  // ============ SUBSCRIPTION (contoh) ============
  await prisma.merchantSubscription.create({
    data: {
      merchantId: m2.id,
      tier: "PRO",
      amount: 99,
      status: "PAID",
      platformShare: 49.5,
      rentPoolShare: 24.75,
      floatingShare: 24.75,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 864e5),
      paidAt: new Date(),
    },
  });

  console.log("✅ Seed v2 selesai:");
  console.log("   Admin      : admin@barangviral.store / Admin123456");
  console.log("   Merchant   : alia@merchant.com / tech@merchant.com (Merchant123456)");
  console.log("   Afiliator  : top@affiliate.com / mid@affiliate.com / leaf@affiliate.com (Affiliate123456)");
  console.log("   Produk     : 6 | Pools: 3");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
