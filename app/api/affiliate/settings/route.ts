import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;

    const affiliate = await withDbRetry(() =>
      prisma.affiliate.findUnique({
        where: { id: authz.affiliateId },
        select: {
          id: true,
          username: true,
          tier: true,
          status: true,
          tiktok: true,
          instagram: true,
          youtube: true,
          facebook: true,
          followers: true,
          bankName: true,
          bankAccount: true,
          bankHolder: true,
          kycVerified: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      })
    );

    if (!affiliate) {
      return NextResponse.json({ error: "Afiliator tidak dijumpai" }, { status: 404 });
    }

    return NextResponse.json({ affiliate });
  } catch (error) {
    console.error("[API /api/affiliate/settings GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;

    const body = await req.json().catch(() => ({}));
    const { name, tiktok, instagram, youtube, facebook, followers, bankName, bankAccount, bankHolder } =
      body;

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }

    const updated = await withDbRetry(() =>
      prisma.affiliate.update({
        where: { id: authz.affiliateId },
        data: {
          ...(tiktok !== undefined ? { tiktok: tiktok || null } : {}),
          ...(instagram !== undefined ? { instagram: instagram || null } : {}),
          ...(youtube !== undefined ? { youtube: youtube || null } : {}),
          ...(facebook !== undefined ? { facebook: facebook || null } : {}),
          ...(followers !== undefined ? { followers: followers ? Number(followers) : null } : {}),
          ...(bankName !== undefined ? { bankName: bankName || null } : {}),
          ...(bankAccount !== undefined ? { bankAccount: bankAccount || null } : {}),
          ...(bankHolder !== undefined ? { bankHolder: bankHolder || null } : {}),
        },
        select: {
          id: true,
          username: true,
          tiktok: true,
          instagram: true,
          youtube: true,
          facebook: true,
          followers: true,
          bankName: true,
          bankAccount: true,
          bankHolder: true,
        },
      })
    );

    if (name !== undefined) {
      await withDbRetry(() =>
        prisma.user.update({ where: { id: authz.user.id }, data: { name } })
      );
    }

    return NextResponse.json({ success: true, affiliate: updated });
  } catch (error) {
    console.error("[API /api/affiliate/settings PUT]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
