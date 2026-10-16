import { NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Peta ikon kategori (nama lucide) untuk UI */
const ICONS: Record<string, string> = {
  Kecantikan: "sparkles",
  Gajet: "smartphone",
  Rumah: "home",
  Fesyen: "shirt",
  Makanan: "utensils",
  Sukan: "dumbbell",
  Automotif: "car",
  Bayi: "baby",
  Kesihatan: "heart-pulse",
  Pendidikan: "graduation-cap",
};

export async function GET() {
  try {
    const groups = await withDbRetry(() =>
      prisma.product.groupBy({
        by: ["category"],
        where: { isActive: true },
        _count: true,
        orderBy: { _count: { category: "desc" } },
      })
    );

    const categories = groups.map((g) => ({
      name: g.category,
      count: g._count,
      icon: ICONS[g.category] ?? "package",
    }));

    const total = categories.reduce((a, c) => a + c.count, 0);

    return NextResponse.json({
      categories,
      total,
      all: { name: "Semua", count: total, icon: "layout-grid" },
    });
  } catch (error) {
    console.error("[API /api/categories]", error);
    return NextResponse.json({ error: "Gagal memuatkan kategori" }, { status: 500 });
  }
}
