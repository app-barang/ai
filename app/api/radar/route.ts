import { NextRequest, NextResponse } from "next/server";
import { groq, hasAI } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { mockTrends } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORMS = ["TikTok", "Shopee", "Lazada", "Instagram"];

export interface TrendingItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  platform: string;
  viralScore: number;
  viralTrend: string;
  mentions: number;
  lastAnalyzed: string | null;
}

async function getLiveProducts(): Promise<TrendingItem[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isViral: true },
      orderBy: [{ viralScore: "desc" }, { sold: "desc" }],
      take: 10,
    });
    if (products.length > 0) {
      return products.map((p, i) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        category: p.category,
        platform: PLATFORMS[i % PLATFORMS.length],
        viralScore: p.viralScore,
        viralTrend: p.viralTrend ?? "stable",
        mentions: p.sold,
        lastAnalyzed: p.lastAnalyzed ? p.lastAnalyzed.toISOString() : null,
      }));
    }
  } catch {
    console.warn("[Radar] DB tidak dapat dicapai, guna data demo");
  }
  // Fallback: data demo
  return mockTrends.slice(0, 10).map((t, i) => ({
    id: t.id,
    name: t.keyword,
    slug: "",
    price: 0,
    category: t.category,
    platform: t.platform || PLATFORMS[i % PLATFORMS.length],
    viralScore: t.score,
    viralTrend: t.score >= 80 ? "rising" : "stable",
    mentions: t.mentions,
    lastAnalyzed: null,
  }));
}

function defaultAnalysis(trending: TrendingItem[]): string {
  if (trending.length === 0) return "Tiada produk viral dikesan buat masa ini.";
  const top = trending[0];
  return (
    `Radar AI mengesan ${trending.length} produk viral minggu ini. ` +
    `"${top.name}" mendahului dengan skor ${top.viralScore}/100. ` +
    `Kategori paling panas: ${top.category}. Masa terbaik untuk promosi ialah sekarang!`
  );
}

async function buildResponse() {
  const trending = await getLiveProducts();

  let analysis = defaultAnalysis(trending);

  if (hasAI() && groq && trending.length > 0) {
    try {
      const prompt = `Analisis 5 produk ini, beri ringkasan BM santai. Return {"analysis": "..."}.
${trending
  .slice(0, 5)
  .map(
    (t, i) =>
      `${i + 1}. ${t.name} (${t.category}, RM${t.price}, skor ${t.viralScore}, trend ${t.viralTrend}, ${t.platform})`
  )
  .join("\n")}
Peraturan: 2 ayat sahaja, Bahasa Melayu santai + 1 emoji. Return JSON sahaja.`;

      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
        reasoning_effort: "low",
      } as never);

      let text = completion.choices[0]?.message?.content?.trim() ?? "";
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(text);
      if (typeof parsed.analysis === "string" && parsed.analysis.length > 0) {
        analysis = parsed.analysis;
      }
    } catch (e) {
      console.error("[Radar Analysis AI]", e);
    }
  }

  return NextResponse.json({
    trending,
    analysis,
    updatedAt: new Date().toISOString(),
  });
}

export async function GET() {
  try {
    return await buildResponse();
  } catch (error) {
    console.error("[API /api/radar]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    void req;
    return await buildResponse();
  } catch (error) {
    console.error("[API /api/radar POST]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
