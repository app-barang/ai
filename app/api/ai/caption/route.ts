import { NextRequest, NextResponse } from "next/server";
import { openRouter, hasAI } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { success } = rateLimit(`caption:${ip}`, 10, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Cuba lagi dalam 1 minit." },
        { status: 429 }
      );
    }

    const { productName, price, tone, platform } = await req.json();
    if (!productName || !tone || !platform) {
      return NextResponse.json(
        { error: "Sila pilih produk, tone, dan platform." },
        { status: 400 }
      );
    }

    // Fallback kalau tiada API key
    if (!hasAI() || !openRouter) {
      return NextResponse.json({
        hook: `Gais, korang takkan percaya... ${productName} ni RM${price} je! 😱`,
        caption: `Serius tak tipu, ${productName} ni memang viral! 🔥\n\nHarga RM${price} je, rating 4.8+, cepat sebelum habis!`,
        hashtags: ["#BarangViral", "#TikTokMadeMeBuyIt", "#MurahGiler", "#WorthIt", "#ViralTikTok", "#ShopeeFinds"],
        tiktokScript: `[0-3s] HOOK: "Gais, korang takkan percaya..."\n[3-15s] Tunjuk produk + manfaat\n[15-25s] Banding harga\n[25-30s] CTA: "Link di bio!"`,
        estimatedEngagement: "Medium",
        fallback: true,
      });
    }

    const prompt = `Anda adalah copywriter TikTok Malaysia yang pakar buat konten viral.

Hasilkan caption untuk:
- Nama: ${productName}
- Harga: RM${price}
- Tone: ${tone}
- Platform: ${platform}

WAJIB return dalam format JSON SAHAJA (tanpa markdown, tanpa explanation):
{
  "hook": "...",
  "caption": "...",
  "hashtags": ["...", "..."],
  "tiktokScript": "...",
  "estimatedEngagement": "High"
}

Peraturan:
- Hook MESTI ada curiosity gap (1 ayat pendek + emoji)
- Caption 2-3 ayat dengan line break
- Hashtags 5-8 relevan
- tiktokScript ada timestamp [0-3s], [3-15s], [15-30s]
- Guna Bahasa Melayu santai
- estimatedEngagement: High/Medium/Low`;

    const completion = await openRouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openrouter/auto",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    let text = completion.choices[0]?.message?.content?.trim() ?? "";
    
    // Bersihkan markdown code fence kalau ada
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    const parsed = JSON.parse(text);

    return NextResponse.json({
      ...parsed,
      fallback: false,
    });
  } catch (error) {
    console.error("[Caption API Error]", error);
    return NextResponse.json(
      { error: "AI sedang rehat. Cuba sebentar lagi." },
      { status: 500 }
    );
  }
}