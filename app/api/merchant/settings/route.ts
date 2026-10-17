import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireMerchant } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;

    const merchant = await withDbRetry(() =>
      prisma.merchant.findUnique({
        where: { id: authz.merchantId },
        select: {
          id: true,
          businessName: true,
          businessType: true,
          ssmNumber: true,
          phone: true,
          address: true,
          bankName: true,
          bankAccount: true,
          bankHolder: true,
          tier: true,
          status: true,
          expiresAt: true,
          createdAt: true,
        },
      })
    );

    if (!merchant) {
      return NextResponse.json({ error: "Merchant tidak dijumpai" }, { status: 404 });
    }

    return NextResponse.json({ merchant });
  } catch (error) {
    console.error("[API /api/merchant/settings GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authz = await requireMerchant();
    if (!authz.ok) return authz.response;

    const body = await req.json().catch(() => ({}));
    const { businessName, businessType, ssmNumber, phone, address, bankName, bankAccount, bankHolder } =
      body;

    if (businessType && !["individual", "sdn_bhd"].includes(businessType)) {
      return NextResponse.json({ error: "Jenis bisnes tidak sah" }, { status: 400 });
    }
    if (businessName !== undefined && !String(businessName).trim()) {
      return NextResponse.json({ error: "Nama bisnes tidak boleh kosong" }, { status: 400 });
    }
    if (phone !== undefined && !String(phone).trim()) {
      return NextResponse.json({ error: "No. telefon tidak boleh kosong" }, { status: 400 });
    }

    const updated = await withDbRetry(() =>
      prisma.merchant.update({
        where: { id: authz.merchantId },
        data: {
          ...(businessName !== undefined ? { businessName } : {}),
          ...(businessType !== undefined ? { businessType } : {}),
          ...(ssmNumber !== undefined ? { ssmNumber: ssmNumber || null } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(address !== undefined ? { address: address || null } : {}),
          ...(bankName !== undefined ? { bankName: bankName || null } : {}),
          ...(bankAccount !== undefined ? { bankAccount: bankAccount || null } : {}),
          ...(bankHolder !== undefined ? { bankHolder: bankHolder || null } : {}),
        },
        select: {
          id: true,
          businessName: true,
          businessType: true,
          ssmNumber: true,
          phone: true,
          address: true,
          bankName: true,
          bankAccount: true,
          bankHolder: true,
        },
      })
    );

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error) {
    console.error("[API /api/merchant/settings PUT]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
