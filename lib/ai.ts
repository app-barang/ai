import OpenAI from "openai";
import { mockProducts } from "./mock-data";

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const baseURL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

export const groq = apiKey && apiKey.length > 10
  ? new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "BarangViral.store",
      },
    })
  : null;

export function hasAI(): boolean {
  return !!apiKey && apiKey.length > 10 && !!groq;
}

/** Ambil produk viral dari DB, fallback ke data demo bila DB down */
async function getViralProducts() {
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { isViral: true, isActive: true },
      orderBy: { viralScore: "desc" },
      take: 5,
      select: { name: true, price: true, rating: true, viralScore: true },
    });
    if (products.length > 0) return products;
  } catch (error) {
    console.warn("[AI] DB tidak dapat dicapai, guna data demo");
  }
  return mockProducts
    .filter((p) => p.isViral)
    .slice(0, 5)
    .map((p) => ({ name: p.name, price: p.price, rating: p.rating, viralScore: p.radarScore }));
}

export const SYSTEM_PROMPTS = {
  buyer: `Anda adalah Pembantu AI BarangViral.store, kedai online Malaysia 
yang jual produk viral dari TikTok, Shopee, Lazada.

Tugas anda:
1. Cadang produk viral berdasarkan bajet & kategori user
2. Semak review palsu jika user bagi link produk
3. Banding harga antara marketplace

Gaya jawapan:
- Bahasa Melayu Malaysia santai & mesra
- Guna emoji secukupnya (jangan berlebihan)
- Sentiasa cadang 2-3 produk dengan harga
- Kalau tak pasti, jujur cakap "saya tak pasti"`,

  affiliate: `Anda adalah Coach Afiliator BarangViral.store.

Tugas anda:
1. Analisis prestasi link afiliator
2. Cadang strategi konten TikTok/IG
3. Buat hook video 3 detik untuk produk
4. Beri tips tingkatkan konversi

Gaya: Semangat, memotivasi, Bahasa Melayu santai.`,
};

function fallbackChatResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("komisen") || lower.includes("commission")) {
    return "Komisen di BarangViral sehingga 50%! 🎉 Afiliator baharu bermula pada 30% dan boleh naik sehingga 50% mengikut prestasi. Semak dashboard anda untuk kadar semasa.";
  }
  if (lower.includes("link") || lower.includes("afiliasi")) {
    return "Untuk jana link afiliasi: pergi ke Dashboard → Link, pilih produk, klik 'Jana Link'. Anda akan dapat short link unik untuk dikongsi di TikTok/Instagram. 📱";
  }
  if (lower.includes("withdraw") || lower.includes("keluar") || lower.includes("wang")) {
    return "Pengeluaran wang boleh dibuat di Dashboard → Wallet. Minimum RM50, proses dalam 1-3 hari bekerja melalui pindahan bank. 💸";
  }
  return "Hai! 👋 Saya **Vira**, pembantu AI BarangViral. Boleh saya bantu cari produk viral, cara jana link afiliasi, atau soalan komisen? (Nota: AI penuh aktif selepas anda set GROQ_API_KEY dalam .env.local)";
}

export async function chatCompletion(
  messages: { role: "user" | "assistant"; content: string }[],
  context: "buyer" | "affiliate" = "buyer"
): Promise<string> {
  if (!hasAI() || !groq) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return fallbackChatResponse(lastUser?.content ?? "");
  }

  try {
    const products = await getViralProducts();

    const productContext = products
      .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Skor Viral ${p.viralScore})`)
      .join("\n");

    const systemPrompt =
      SYSTEM_PROMPTS[context] +
      `\n\nProduk viral semasa:\n${productContext}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content ?? "Maaf, saya tidak dapat menjawab.";
  } catch (error) {
    console.error("[AI Chat Error]", error);
    return "Maaf, berlaku ralat pada AI. Sila cuba lagi sebentar lagi.";
  }
}

export async function chatCompletionStream(
  messages: { role: "user" | "assistant"; content: string }[],
  context: "buyer" | "affiliate" = "buyer"
): Promise<ReadableStream<Uint8Array>> {
  if (!hasAI() || !groq) {
    const fallback = fallbackChatResponse(
      [...messages].reverse().find((m) => m.role === "user")?.content ?? ""
    );
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fallback));
        controller.close();
      },
    });
  }

  try {
    const products = await getViralProducts();

    const productContext = products
      .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Skor Viral ${p.viralScore})`)
      .join("\n");

    const systemPrompt =
      SYSTEM_PROMPTS[context] +
      `\n\nProduk viral semasa:\n${productContext}`;

    const stream = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.8,
      stream: true,
    });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("[Stream error]", err);
        } finally {
          controller.close();
        }
      },
    });
  } catch (error) {
    console.error("[AI Chat Stream Error]", error);
    const fallback = "Maaf, AI sedang rehat. Cuba lagi nanti.";
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fallback));
        controller.close();
      },
    });
  }
}

export async function radarAnalysis(query?: string): Promise<string> {
  if (!hasAI() || !groq) {
    return "Radar AI dalam mod demo. Tambah GROQ_API_KEY untuk analisis trend penuh. 📡";
  }

  try {
    let trending: { name: string; price: number; category: string; viralScore: number }[] = [];
    try {
      const { default: prisma } = await import("@/lib/prisma");
      trending = await prisma.product.findMany({
        where: { isViral: true, isActive: true },
        take: 10,
        select: { name: true, price: true, category: true, viralScore: true },
        orderBy: { viralScore: "desc" },
      });
    } catch {
      console.warn("[AI] DB tidak dapat dicapai, guna data demo");
    }
    if (trending.length === 0) {
      trending = mockProducts
        .filter((p) => p.isViral)
        .map((p) => ({ name: p.name, price: p.price, category: p.category, viralScore: p.radarScore }));
    }

    const prompt = `Anda ialah "Radar AI" BarangViral.store.
Tugas: analisis trend produk viral di TikTok, Shopee, Lazada dan Instagram untuk pasaran Malaysia.
Beri output ringkas: 3-5 item trend teratas dengan skor 0-100, sebab singkat trend, dan saranan kategori.
Gunakan format JSON ringkas jika diminta.

Produk viral semasa:
${trending.map((p) => `- ${p.name} (${p.category}, RM${p.price}, Skor Viral ${p.viralScore})`).join("\n")}

Query user: ${query ?? "Apakah 5 produk/trend paling viral di Malaysia sekarang?"}`;

    const completion = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? "Tiada analisis tersedia.";
  } catch (error) {
    console.error("[AI Radar Error]", error);
    return "Radar AI menghadapi masalah. Sila cuba lagi.";
  }
}

export async function generateCaption(
  productName: string,
  platform: string,
  price?: number,
  tone?: string
): Promise<string> {
  if (!hasAI() || !groq) {
    return `🔥 ${productName} memang VIRAL! Jangan lepaskan peluang. Order sekarang! #barangviral #${platform.toLowerCase()} #trending`;
  }

  try {
    const prompt = `Anda adalah copywriter TikTok Malaysia yang pakar buat konten viral.

Hasilkan caption untuk:
- Nama: ${productName}
- Harga: ${price ? `RM${price}` : "harga best"}
- Tone: ${tone || "Informatif"}
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

    const completion = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.9,
      response_format: { type: "json_object" },
      reasoning_effort: "low",
    } as never);

    let text = completion.choices[0]?.message?.content?.trim() ?? "";
    
    // Bersihkan markdown code fence kalau ada
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    return text;
  } catch (error) {
    console.error("[AI Caption Error]", error);
    return `🔥 ${productName} memang VIRAL! Jangan lepaskan peluang. Order sekarang! #barangviral #trending`;
  }
}