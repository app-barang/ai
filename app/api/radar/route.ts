import { NextRequest, NextResponse } from "next/server";
import { groq, hasAI } from "@/lib/ai";
import { mockTrends } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query;

    // Simulasi pergerakan skor untuk demo
    const trends = mockTrends.map((t) => ({
      ...t,
      score: Math.min(99, Math.max(40, t.score + Math.round((Math.random() - 0.5) * 6))),
      mentions: t.mentions + Math.round(Math.random() * 300),
    })).sort((a, b) => b.score - a.score);

    let analysis = "";
    if (hasAI() && groq) {
      const prompt = `Anda ialah "Radar AI" BarangViral.store.
Tugas: analisis trend produk viral di TikTok, Shopee, Lazada dan Instagram untuk pasaran Malaysia.
Beri output ringkas: 3-5 item trend teratas dengan skor 0-100, sebab singkat trend, dan saranan kategori.
Gunakan format JSON ringkas jika diminta.

Produk viral semasa:
${trends.slice(0, 10).map((t) => `- ${t.keyword} (${t.category}, Skor ${t.score}, ${t.platform})`).join("\n")}

Query user: ${query ?? "Apakah 5 produk/trend paling viral di Malaysia sekarang?"}`;

      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      });

      analysis = completion.choices[0]?.message?.content ?? "";
    }

    return NextResponse.json({
      analysis,
      trends,
      scannedAt: new Date().toISOString(),
      platforms: ["TikTok", "Shopee", "Lazada", "Instagram"],
    });
  } catch (error) {
    console.error("[API /api/radar]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function GET() {
  const trends = [...mockTrends].sort((a, b) => b.score - a.score);
  return NextResponse.json({
    trends,
    scannedAt: new Date().toISOString(),
    platforms: ["TikTok", "Shopee", "Lazada", "Instagram"],
  });
}