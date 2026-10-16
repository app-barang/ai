import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { withDbRetry } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS = ["STARTER", "PRO", "BUSINESS"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      password,
      businessName,
      businessType = "individual",
      ssmNumber,
      phone,
      address,
      bankName,
      bankAccount,
      bankHolder,
      tier = "STARTER",
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email dan kata laluan diperlukan" },
        { status: 400 }
      );
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Kata laluan minimum 8 aksara" }, { status: 400 });
    }
    if (!businessName || !phone) {
      return NextResponse.json(
        { error: "Nama bisnes dan telefon diperlukan" },
        { status: 400 }
      );
    }
    if (!["individual", "sdn_bhd"].includes(businessType)) {
      return NextResponse.json(
        { error: "businessType mesti 'individual' atau 'sdn_bhd'" },
        { status: 400 }
      );
    }
    if (!TIERS.includes(tier)) {
      return NextResponse.json({ error: "Tier tidak sah" }, { status: 400 });
    }

    const existing = await withDbRetry(() => prisma.user.findUnique({ where: { email } }));
    if (existing) {
      return NextResponse.json({ error: "Email sudah didaftarkan" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await withDbRetry(() =>
      prisma.user.create({
        data: { name, email, password: hashed, role: "MERCHANT" },
      })
    );

    const merchant = await withDbRetry(() =>
      prisma.merchant.create({
        data: {
          userId: user.id,
          businessName,
          businessType,
          ssmNumber: ssmNumber || null,
          phone,
          address: address || null,
          bankName: bankName || null,
          bankAccount: bankAccount || null,
          bankHolder: bankHolder || null,
          tier,
          status: "PENDING",
        },
      })
    );

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        merchantId: merchant.id,
        businessName: merchant.businessName,
        tier: merchant.tier,
        status: merchant.status,
        next: "Sila langgan (POST /api/merchant/subscribe) untuk aktifkan akaun",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/merchant/register]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
