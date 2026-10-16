import { NextRequest } from "next/server";
import { groq, hasAI, SYSTEM_PROMPTS } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { mockProducts } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getProductContext(): Promise<string> {
  try {
    const products = await prisma.product.findMany({
      where: { isViral: true, isActive: true },
      orderBy: { viralScore: "desc" },
      take: 5,
      select: { name: true, price: true, rating: true, viralScore: true },
    });
    if (products.length > 0) {
      return products
        .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Skor Viral ${p.viralScore})`)
        .join("\n");
    }
  } catch (error) {
    console.warn("[Chat] DB tidak dapat dicapai, guna data demo");
  }
  // Fallback: data demo
  return mockProducts
    .filter((p) => p.isViral)
    .slice(0, 5)
    .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Skor Viral ${p.radarScore})`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context = "buyer" } = await req.json();

    if (!hasAI() || !groq) {
      return Response.json({
        reply: "Hai! Saya dalam mod demo. Untuk aktifkan AI, sila set GROQ_API_KEY dalam .env.local 😊",
        fallback: true,
      });
    }

    // Ambil produk viral sebagai context (DB dengan fallback demo)
    const productContext = await getProductContext();

    const systemPrompt =
      SYSTEM_PROMPTS[context as keyof typeof SYSTEM_PROMPTS] +
      `\n\nProduk viral semasa:\n${productContext}`;

    const stream = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.8,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
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

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return Response.json(
      { error: "AI sedang rehat. Cuba lagi nanti." },
      { status: 500 }
    );
  }
}