import { NextResponse } from "next/server";
import { groq, hasAI } from "@/lib/ai";
import prisma, { withDbRetry } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Skor matematik fallback bila AI tiada */
function mathScore(
  sold: number,
  rating: number,
  index: number
): { viralScore: number; viralTrend: string } {
  const viralScore = Math.min(
    100,
    Math.round((sold / 1000) * 5 + rating * 15 + (10 - index) * 2)
  );
  const viralTrend = index < 3 ? "rising" : "stable";
  return { viralScore, viralTrend };
}

export async function POST() {
  try {
    const products = await withDbRetry(() =>
      prisma.product.findMany({
        where: { isViral: true, isActive: true },
        orderBy: { sold: "desc" },
        take: 10,
      })
    );

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tiada produk viral" },
        { status: 404 }
      );
    }

    let mode: "ai" | "fallback" = "fallback";
    let scores = products.map((p, i) => mathScore(p.sold, p.rating, i));

    if (hasAI() && groq) {
      try {
        const prompt = `Analisa produk ini, beri viralScore (0-100) dan viralTrend (rising/stable/falling). Return JSON sahaja.
${products
  .map(
    (p, i) =>
      `${i + 1}. ${p.name} (${p.category}, RM${p.price}, rating ${p.rating}, terjual ${p.sold}, skor semasa ${p.viralScore})`
  )
  .join("\n")}
Format: {"products": [{"index":1,"viralScore":95,"viralTrend":"rising"}]}`;

        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.5,
          response_format: { type: "json_object" },
          reasoning_effort: "low",
        } as never);

        let text = completion.choices[0]?.message?.content?.trim() ?? "";
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          scores = products.map((p, i) => {
            const s = parsed.products.find(
              (x: { index: number }) => x.index === i + 1
            );
            const raw = Number(s?.viralScore);
            const viralScore = Number.isFinite(raw)
              ? Math.max(0, Math.min(100, Math.round(raw)))
              : mathScore(p.sold, p.rating, i).viralScore;
            const viralTrend = ["rising", "stable", "falling"].includes(s?.viralTrend)
              ? s.viralTrend
              : "stable";
            return { viralScore, viralTrend };
          });
          mode = "ai";
        }
      } catch (e) {
        console.error("[Radar Analyze AI]", e);
      }
    }

    const now = new Date();
    await withDbRetry(() =>
      prisma.$transaction(
        products.map((p, i) =>
          prisma.product.update({
            where: { id: p.id },
            data: {
              viralScore: scores[i].viralScore,
              viralTrend: scores[i].viralTrend,
              lastAnalyzed: now,
            },
          })
        )
      )
    );

    return NextResponse.json({ success: true, analyzed: products.length, mode });
  } catch (error) {
    console.error("[API /api/radar/analyze]", error);
    return NextResponse.json({ success: false, error: "Ralat pelayan" }, { status: 500 });
  }
}
