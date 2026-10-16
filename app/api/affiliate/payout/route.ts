import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAffiliate } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_PAYOUT = 50;
const METHODS = ["bank", "tng", "grabpay"];

export async function POST(req: NextRequest) {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;
    const { affiliateId } = authz;

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const method = String(body.method ?? "bank");
    const accountInfo = String(body.accountInfo ?? "");

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Jumlah tidak sah" }, { status: 400 });
    }
    if (amount < MIN_PAYOUT) {
      return NextResponse.json(
        { error: `Minimum pengeluaran RM${MIN_PAYOUT}` },
        { status: 400 }
      );
    }
    if (!METHODS.includes(method)) {
      return NextResponse.json(
        { error: "Kaedah tidak sah (bank / tng / grabpay)" },
        { status: 400 }
      );
    }

    const affiliate = await withDbRetry(() =>
      prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { balance: true, pendingBalance: true, bankAccount: true, bankName: true },
      })
    );
    if (!affiliate) {
      return NextResponse.json({ error: "Afiliator tidak dijumpai" }, { status: 404 });
    }

    if (amount > affiliate.balance) {
      return NextResponse.json(
        { error: `Jumlah melebihi baki (RM${affiliate.balance.toFixed(2)})` },
        { status: 400 }
      );
    }

    const [payout] = await withDbRetry(() =>
      prisma.$transaction([
        prisma.payout.create({
          data: {
            affiliateId,
            amount,
            method,
            accountInfo: accountInfo || affiliate.bankAccount || "-",
            status: "PENDING",
          },
        }),
        prisma.affiliate.update({
          where: { id: affiliateId },
          data: {
            balance: { decrement: amount },
            pendingBalance: { increment: amount },
          },
        }),
      ])
    );

    return NextResponse.json(
      {
        success: true,
        payout: {
          id: payout.id,
          amount: payout.amount,
          method: payout.method,
          status: payout.status,
          requestedAt: payout.requestedAt,
        },
        newBalance: Number((affiliate.balance - amount).toFixed(2)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/affiliate/payout]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authz = await requireAffiliate();
    if (!authz.ok) return authz.response;

    const payouts = await withDbRetry(() =>
      prisma.payout.findMany({
        where: { affiliateId: authz.affiliateId },
        orderBy: { requestedAt: "desc" },
        take: 30,
      })
    );

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error("[API /api/affiliate/payout GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
