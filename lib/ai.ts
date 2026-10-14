import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";
const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export const openRouter = apiKey && apiKey.length > 10
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
  return !!apiKey && apiKey.length > 10 && !!openRouter;
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
  return "Hai! 👋 Saya Aiden, pembantu AI BarangViral. Boleh saya bantu cari produk viral, cara jana link afiliasi, atau soalan komisen? (Nota: AI penuh aktif selepas anda set OPENROUTER_API_KEY dalam .env.local)";
}

export async function chatCompletion(
  messages: { role: "user" | "assistant"; content: string }[],
  context: "buyer" | "affiliate" = "buyer"
): Promise<string> {
  if (!hasAI() || !openRouter) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return fallbackChatResponse(lastUser?.content ?? "");
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { isViral: true },
      take: 5,
      select: { name: true, price: true, rating: true, radarScore: true },
    });

    const productContext = products
      .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Radar Score ${p.radarScore})`)
      .join("\n");

    const systemPrompt =
      SYSTEM_PROMPTS[context] +
      `\n\nProduk viral semasa:\n${productContext}`;

    const completion = await openRouter.chat.completions.create({
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
  if (!hasAI() || !openRouter) {
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
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { isViral: true },
      take: 5,
      select: { name: true, price: true, rating: true, radarScore: true },
    });

    const productContext = products
      .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Radar Score ${p.radarScore})`)
      .join("\n");

    const systemPrompt =
      SYSTEM_PROMPTS[context] +
      `\n\nProduk viral semasa:\n${productContext}`;

    const stream = await openRouter.chat.completions.create({
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
  if (!hasAI() || !openRouter) {
    return "Radar AI dalam mod demo. Tambah OPENROUTER_API_KEY untuk analisis trend penuh. 📡";
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const trending = await prisma.product.findMany({
      where: { isViral: true },
      take: 10,
      select: { name: true, price: true, category: true, radarScore: true, marketplace: true },
      orderBy: { radarScore: "desc" },
    });

    const prompt = `Anda ialah "Radar AI" BarangViral.store.
Tugas: analisis trend produk viral di TikTok, Shopee, Lazada dan Instagram untuk pasaran Malaysia.
Beri output ringkas: 3-5 item trend teratas dengan skor 0-100, sebab singkat trend, dan saranan kategori.
Gunakan format JSON ringkas jika diminta.

Produk viral semasa:
${trending.map((p) => `- ${p.name} (${p.category}, RM${p.price}, Radar ${p.radarScore}, ${p.marketplace})`).join("\n")}

Query user: ${query ?? "Apakah 5 produk/trend paling viral di Malaysia sekarang?"}`;

    const completion = await openRouter.chat.completions.create({
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
  if (!hasAI() || !openRouter) {
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

    const completion = await openRouter.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
    });

    let text = completion.choices[0]?.message?.content?.trim() ?? "";
    
    // Bersihkan markdown code fence kalau ada
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    return text;
  } catch (error) {
    console.error("[AI Caption Error]", error);
    return `🔥 ${productName} memang VIRAL! Jangan lepaskan peluang. Order sekarang! #barangviral #trending`;
  }
}