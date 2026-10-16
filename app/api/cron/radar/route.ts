import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Tidak berkebenaran" }, { status: 401 });
  }

  try {
    const url = new URL("/api/radar/analyze", req.nextUrl.origin);
    const res = await fetch(url, { method: "POST" });
    const result = await res.json().catch(() => ({}));
    return NextResponse.json({ success: res.ok, ...result });
  } catch (error) {
    console.error("[Cron Radar]", error);
    return NextResponse.json({ success: false, error: "Ralat cron" }, { status: 500 });
  }
}
