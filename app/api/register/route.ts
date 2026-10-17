import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { withDbRetry } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!rateLimit(`daftar:${ip}`, 10, 60_000).success) {
      return NextResponse.json(
        { error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
        { status: 429 }
      );
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email dan kata laluan diperlukan" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Kata laluan sekurang-kurangnya 8 aksara" },
        { status: 400 }
      );
    }

    const existing = await withDbRetry(() =>
      prisma.user.findUnique({ where: { email } })
    );
    if (existing) {
      return NextResponse.json({ error: "Email sudah didaftarkan" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await withDbRetry(() =>
      prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: role === "AFFILIATE" ? "AFFILIATE" : "BUYER",
        },
      })
    );

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("[API /api/register]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
