// Pendaftaran afiliator - API
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, username, tiktok, instagram, youtube, followers, bankName, bankAccount } =
      await req.json();

    // Validasi
    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { error: "Nama, email, kata laluan dan username diperlukan" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Kata laluan min. 8 aksara" }, { status: 400 });
    }
    if (!tiktok && !instagram && !youtube) {
      return NextResponse.json(
        { error: "Isi sekurang-kurangnya satu media sosial" },
        { status: 400 }
      );
    }
    if (!bankName || !bankAccount) {
      return NextResponse.json({ error: "Butiran bank diperlukan" }, { status: 400 });
    }

    // Semak email & username
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah didaftarkan" }, { status: 409 });
    }
    const existingAff = await prisma.affiliate.findUnique({ where: { username } });
    if (existingAff) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Cipta user + affiliate dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "AFFILIATE",
        },
      });

      const affiliate = await tx.affiliate.create({
        data: {
          userId: user.id,
          username,
          tiktok: tiktok || null,
          instagram: instagram || null,
          youtube: youtube || null,
          followers: followers || null,
          bankName,
          bankAccount,
          commissionRate: 0.3, // bermula 30%, naik sehingga 50%
        },
      });

      return { user, affiliate };
    });

    return NextResponse.json(
      { success: true, userId: result.user.id, affiliateId: result.affiliate.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/affiliate/register]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
