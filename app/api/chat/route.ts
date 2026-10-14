import { NextRequest } from "next/server";
import { openRouter, hasAI, SYSTEM_PROMPTS } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { messages, context = "buyer" } = await req.json();

    if (!hasAI() || !openRouter) {
      return Response.json({
        reply: "Hai! Saya dalam mod demo. Untuk aktifkan AI, sila set OPENROUTER_API_KEY dalam .env.local 😊",
        fallback: true,
      });
    }

    // Ambil produk viral sebagai context
    const products = await prisma.product.findMany({
      where: { isViral: true },
      take: 5,
      select: { name: true, price: true, rating: true, radarScore: true },
    });

    const productContext = products
      .map((p) => `- ${p.name} (RM${p.price}, ⭐${p.rating}, Radar Score ${p.radarScore})`)
      .join("\n");

    const systemPrompt =
      SYSTEM_PROMPTS[context as keyof typeof SYSTEM_PROMPTS] +
      `\n\nProduk viral semasa:\n${productContext}`;

    const stream = await openRouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
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