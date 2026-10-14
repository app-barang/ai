// Seed data - barangviral.store
// Guna: npx prisma db push && npm run db:seed
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "Blender Soup & Smoothie 1.5L",
    slug: "blender-soup-smoothie",
    description:
      "Blender berkuasa 800W untuk soup, smoothie dan juice. Pisau stainless 6 bilah, bebas BPA. Viral untuk breakfast prep.",
    price: 89.9,
    comparePrice: 199.0,
    images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600"],
    category: "Rumah",
    rating: 4.6,
    sold: 5400,
    stock: 120,
    isViral: true,
    radarScore: 82,
    marketplace: "Shopee",
    externalUrl: "https://shopee.com.my",
  },
  {
    name: "Lampu Galaxy Projektor",
    slug: "lampu-galaxy-projektor",
    description:
      "Projektor bintang galaxy 360° dengan kesan awan berubah warna. Hadiah popular, suasana bilik seperti planetarium.",
    price: 35.9,
    comparePrice: 79.9,
    images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600"],
    category: "Rumah",
    rating: 4.7,
    sold: 18300,
    stock: 340,
    isViral: true,
    radarScore: 91,
    marketplace: "TikTok Shop",
    externalUrl: "https://shopee.com.my",
  },
  {
    name: "TWS Earbuds Bass Pro",
    slug: "tws-earbuds-bass-pro",
    description:
      "Earbud wireless true stereo dengan bass mendalam, battery 40jam, IPX5 tahan air. Sesuai untuk senaman dan harian.",
    price: 45.9,
    comparePrice: 129.0,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"],
    category: "Gajet",
    rating: 4.5,
    sold: 21700,
    stock: 480,
    isViral: true,
    radarScore: 88,
    marketplace: "Lazada",
    externalUrl: "https://lazada.com.my",
  },
  {
    name: "Serum Vitamin C Brightening",
    slug: "serum-vitamin-c-brightening",
    description:
      "Serum Vitamin C 20% - cerahkan kulit, pudarkan jeragat, antioksidan. Formula Malaysia, sesuai iklim tropika.",
    price: 25.9,
    comparePrice: 59.9,
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"],
    category: "Kecantikan",
    rating: 4.9,
    sold: 22000,
    stock: 620,
    isViral: true,
    radarScore: 96,
    marketplace: "Instagram Shop",
    externalUrl: "https://instagram.com",
  },
  {
    name: "Beg Anti Air 20L",
    slug: "beg-anti-air-20l",
    description:
      "Beg anti air 20L dengan lapisan TPU, sesuai mendaki, berkemah dan harian hujan. Banyak poket, tali pelapuk.",
    price: 55.9,
    comparePrice: 119.0,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
    category: "Sukan",
    rating: 4.4,
    sold: 3600,
    stock: 150,
    isViral: false,
    radarScore: 68,
    marketplace: "Shopee",
    externalUrl: "https://shopee.com.my",
  },
  {
    name: "Keyboard RGB Mekanis 87",
    slug: "keyboard-rgb-mekanis",
    description:
      "Keyboard RGB mekanis 87 kunci, switch biru, sambungan USB-C. Backlight 19 mod, sesuai gaming dan kerja.",
    price: 79.9,
    comparePrice: 169.0,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
    category: "Gajet",
    rating: 4.6,
    sold: 4900,
    stock: 95,
    isViral: false,
    radarScore: 74,
    marketplace: "Lazada",
    externalUrl: "https://lazada.com.my",
  },
  {
    name: "Mop 360 Putar Tanpa Tangan",
    slug: "mop-360-putar",
    description:
      "Mop 360° dengan sistem putar tanpa tangan, lap mikrofiber boleh dicuci. Bersihkan lantai tanpa menunduk.",
    price: 29.9,
    comparePrice: 65.0,
    images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600"],
    category: "Rumah",
    rating: 4.5,
    sold: 9800,
    stock: 260,
    isViral: true,
    radarScore: 85,
    marketplace: "TikTok Shop",
    externalUrl: "https://shopee.com.my",
  },
  {
    name: "Powerbank 20000mAh Fast Charge",
    slug: "powerbank-20000mah",
    description:
      "Powerbank 20000mAh dengan fast charge 22.5W, display LED digital. Boleh cas dua telefon serentak.",
    price: 49.9,
    comparePrice: 99.0,
    images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"],
    category: "Gajet",
    rating: 4.7,
    sold: 13400,
    stock: 310,
    isViral: true,
    radarScore: 89,
    marketplace: "Shopee",
    externalUrl: "https://shopee.com.my",
  },
];

async function main() {
  // Admin demo
  const adminPassword = await bcrypt.hash("admin12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@barangviral.store" },
    update: {},
    create: {
      name: "Pentadbir",
      email: "admin@barangviral.store",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Produk
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log("✅ Seed selesai: admin + 8 produk demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
