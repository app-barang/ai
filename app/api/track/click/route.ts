import { NextRequest, NextResponse } from "next/server";
import { processClick } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { affiliateUsername, productId } = body;

    if (!affiliateUsername || !productId) {
      return NextResponse.json(
        { error: "affiliateUsername dan productId diperlukan" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const userAgent = req.headers.get("user-agent");
    const referrer = req.headers.get("referer");

    const result = await processClick({
      affiliateUsername,
      productId,
      ip,
      userAgent,
      referrer,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[API /api/track/click]", error);
    const msg = (error as Error).message || "Ralat pelayan";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
