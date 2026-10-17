import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { withDbRetry } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!rateLimit(`daftar-afiliator:${ip}`, 10, 60_000).success) {
      return NextResponse.json(
        { error: "Terlalu banyak percubaan. Sila cuba semula sebentar lagi." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      password,
      username,
      uplineCode,
      tiktok,
      instagram,
      youtube,
      facebook,
      followers,
      bankName,
      bankAccount,
      bankHolder,
    } = body;

    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { error: "Nama, email, kata laluan dan username diperlukan" },
        { status: 400 }
      );
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Kata laluan minimum 8 aksara" }, { status: 400 });
    }
    if (String(username).length < 3) {
      return NextResponse.json({ error: "Username minimum 3 aksara" }, { status: 400 });
    }

    // Semak email & username (selari)
    const [existingUser, existingAff, upline] = await Promise.all([
      withDbRetry(() => prisma.user.findUnique({ where: { email } })),
      withDbRetry(() => prisma.affiliate.findUnique({ where: { username } })),
      uplineCode
        ? withDbRetry(() =>
            prisma.affiliate.findUnique({
              where: { username: uplineCode },
              include: { upline: { include: { upline: true } } },
            })
          )
        : Promise.resolve(null),
    ]);

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah didaftarkan" }, { status: 409 });
    }
    if (existingAff) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }
    if (uplineCode && !upline) {
      return NextResponse.json({ error: "Kod rujukan tidak sah" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await withDbRetry(() =>
      prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "AFFILIATE",
        },
      })
    );

    const affiliate = await withDbRetry(() =>
      prisma.affiliate.create({
        data: {
          userId: user.id,
          username,
          uplineId: upline?.id ?? null,
          tiktok: tiktok || null,
          instagram: instagram || null,
          youtube: youtube || null,
          facebook: facebook || null,
          followers: followers ? Number(followers) : null,
          bankName: bankName || null,
          bankAccount: bankAccount || null,
          bankHolder: bankHolder || null,
        },
      })
    );

    // Kemas kini kiraan level upline (L1 ke atas, L2 ke atasan, L3 ke atasan-atasan)
    if (upline) {
      const ops = [
        prisma.affiliate.update({
          where: { id: upline.id },
          data: { level1Count: { increment: 1 } },
        }),
      ];
      if (upline.uplineId) {
        ops.push(
          prisma.affiliate.update({
            where: { id: upline.uplineId },
            data: { level2Count: { increment: 1 } },
          })
        );
      }
      if (upline.upline?.uplineId) {
        ops.push(
          prisma.affiliate.update({
            where: { id: upline.upline.uplineId },
            data: { level3Count: { increment: 1 } },
          })
        );
      }
      await withDbRetry(() => prisma.$transaction(ops));
    }

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        affiliateId: affiliate.id,
        username: affiliate.username,
        upline: upline ? upline.username : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/affiliate/register]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
