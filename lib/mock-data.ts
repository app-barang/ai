// Data mock untuk pembangunan tanpa database
import type { Product, TrendItem, Category, AffiliateStats, Withdrawal } from "@/types";

export const mockCategories: Category[] = [
  { id: "1", name: "Kecantikan", icon: "sparkles", count: 128 },
  { id: "2", name: "Gajet", icon: "smartphone", count: 96 },
  { id: "3", name: "Rumah", icon: "home", count: 74 },
  { id: "4", name: "Fesyen", icon: "shirt", count: 152 },
  { id: "5", name: "Makanan", icon: "utensils", count: 89 },
  { id: "6", name: "Sukan", icon: "dumbbell", count: 43 },
  { id: "7", name: "Automotif", icon: "car", count: 31 },
  { id: "8", name: "Bayi", icon: "baby", count: 27 },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "LED Face Mask Therapy 7 Warna",
    slug: "led-face-mask-therapy",
    description:
      "Topeng muka LED 7 warna terapi kulit - anti jerawat, anti penuan, cerahkan kulit. Viral di TikTok dengan 50j+ views. Mudah digunakan, sesuai untuk semua jenis kulit.",
    price: 49.9,
    comparePrice: 129.9,
    images: ["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600"],
    category: "Kecantikan",
    rating: 4.8,
    sold: 12500,
    stock: 340,
    isViral: true,
    radarScore: 94,
    marketplace: "TikTok Shop",
    externalUrl: "#",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Mini Portable Printer Tanpa Ink",
    slug: "mini-printer-tanpa-ink",
    description:
      "Printer mini Bluetooth tanpa dakwat - print sticker, nota, jadual belajar. Sesuai untuk pelajar dan pejabat. Viral untuk buat jadual study aesthetic.",
    price: 39.9,
    comparePrice: 89.9,
    images: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600"],
    category: "Gajet",
    rating: 4.7,
    sold: 8900,
    stock: 210,
    isViral: true,
    radarScore: 88,
    marketplace: "Shopee",
    externalUrl: "#",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    name: "Gelas Ajaib Pudu Magic",
    slug: "gelas-ajaib-magic",
    description:
      "Gelas ajaib yang berubah warna mengikut suhu minuman. Hadiah perfect untuk kawan & keluarga. Design comel, selamat minum.",
    price: 19.9,
    comparePrice: 45.0,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"],
    category: "Rumah",
    rating: 4.5,
    sold: 15200,
    stock: 500,
    isViral: true,
    radarScore: 91,
    marketplace: "Lazada",
    externalUrl: "#",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p4",
    name: "Tas Sekolah Kekinian Aesthetic",
    slug: "tas-sekolah-kekinian",
    description:
      "Beg sekolah/direktori kekinian dengan banyak poket, sesuai untuk pelajar sekolah menengah dan universiti. Pelbagai warna aesthetic.",
    price: 29.9,
    comparePrice: 65.0,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
    category: "Fesyen",
    rating: 4.6,
    sold: 6700,
    stock: 180,
    isViral: false,
    radarScore: 72,
    marketplace: "Shopee",
    externalUrl: "#",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p5",
    name: "Serum Vitamin C Brightening",
    slug: "serum-vitamin-c-brightening",
    description:
      "Serum Vitamin C 20% - cerahkan kulit, pudarkan jeragat, antioksidan. Formula Malaysia, sesuai iklim tropika. Viral di Instagram.",
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
    externalUrl: "#",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p6",
    name: "Cooling Gel Pad Leher USB",
    slug: "cooling-gel-pad-leher",
    description:
      "Gel penyejuk leher USB - legakan sakit leher & bahu akibat duduk lama depan laptop. Wajib untuk pekerja office & gamer.",
    price: 35.9,
    comparePrice: 79.0,
    images: ["https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600"],
    category: "Sukan",
    rating: 4.4,
    sold: 4200,
    stock: 150,
    isViral: false,
    radarScore: 65,
    marketplace: "Lazada",
    externalUrl: "#",
    createdAt: new Date().toISOString(),
  },
];

export const mockTrends: TrendItem[] = [
  { id: "t1", keyword: "LED Face Mask", platform: "TikTok", score: 94, growth: 320, mentions: 52000, category: "Kecantikan" },
  { id: "t2", keyword: "Serum Vitamin C", platform: "Instagram", score: 96, growth: 280, mentions: 48000, category: "Kecantikan" },
  { id: "t3", keyword: "Gelas Ajaib Magic", platform: "Shopee", score: 91, growth: 240, mentions: 31000, category: "Rumah" },
  { id: "t4", keyword: "Mini Printer", platform: "TikTok", score: 88, growth: 190, mentions: 27000, category: "Gajet" },
  { id: "t5", keyword: "Tas Aesthetic", platform: "Instagram", score: 72, growth: 150, mentions: 19000, category: "Fesyen" },
  { id: "t6", keyword: "Cooling Gel Pad", platform: "Lazada", score: 65, growth: 120, mentions: 12000, category: "Sukan" },
  { id: "t7", keyword: "Rak Solek Lipat", platform: "TikTok", score: 78, growth: 175, mentions: 16000, category: "Rumah" },
  { id: "t8", keyword: "Wireless Earbuds Bass", platform: "Shopee", score: 69, growth: 95, mentions: 14500, category: "Gajet" },
];

export const mockAffiliateStats: AffiliateStats = {
  totalClicks: 12450,
  totalConversions: 486,
  totalEarnings: 2840.5,
  balance: 1250.75,
  conversionRate: 0.039,
  commissionRate: 0.35,
};

export const mockRecentLinks = [
  { id: "l1", shortCode: "bvx7k2m9", product: "LED Face Mask Therapy", clicks: 3420, conversions: 142, earnings: 709.58, createdAt: "2026-09-30" },
  { id: "l2", shortCode: "bvx3p8q1", product: "Serum Vitamin C Brightening", clicks: 5210, conversions: 198, earnings: 1027.62, createdAt: "2026-10-02" },
  { id: "l3", shortCode: "bvx9m4t6", product: "Mini Portable Printer", clicks: 1890, conversions: 76, earnings: 531.24, createdAt: "2026-10-05" },
  { id: "l4", shortCode: "bvx2n5w3", product: "Gelas Ajaib Magic", clicks: 1930, conversions: 70, earnings: 272.30, createdAt: "2026-10-08" },
];

export const mockWithdrawals: Withdrawal[] = [
  { id: "w1", affiliateId: "aff1", amount: 500, method: "Pindahan Bank (Maybank)", status: "APPROVED", createdAt: "2026-09-15" },
  { id: "w2", affiliateId: "aff1", amount: 350, method: "Pindahan Bank (Maybank)", status: "APPROVED", createdAt: "2026-09-28" },
  { id: "w3", affiliateId: "aff1", amount: 400, method: "Pindahan Bank (CIMB)", status: "PENDING", createdAt: "2026-10-10" },
];

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id || p.slug === id);
}
