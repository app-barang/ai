import { NextRequest, NextResponse } from "next/server";
import { generateShortCode } from "@/lib/utils";

// Dalam produksi, simpan link ke database Prisma.
// Di sini kita kembalikan respons tanpa menyimpan (mod demo).

interface Body {
  productId?: string;
  affiliateId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();

    if (!body.productId) {
      return NextResponse.json({ error: "productId diperlukan" }, { status: 400 });
    }

    const shortCode = generateShortCode();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/r/${shortCode}`;

    // TODO (dengan DB):
    // const link = await prisma.affLink.create({
    //   data: {
    //     affiliateId: body.affiliateId,
    //     productId: body.productId,
    //     shortCode,
    //   },
    // });

    return NextResponse.json({
      success: true,
      link: {
        id: `demo_${shortCode}`,
        shortCode,
        url,
        productId: body.productId,
        clicks: 0,
        conversions: 0,
        earnings: 0,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /api/affiliate/link]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
