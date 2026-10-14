// Pengeluaran komisen (wallet) - API
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const MIN_WITHDRAW = 50;

export async function GET() {
  // Senarai sejarah pengeluaran
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Tidak berkebenaran" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id?: string }).id },
      include: { affiliate: true },
    });

    if (!user?.affiliate) {
      return NextResponse.json({ error: "Bukan afiliator" }, { status: 403 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { affiliateId: user.affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("[API /api/affiliate/withdraw GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Cipta permintaan pengeluaran
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Tidak berkebenaran" }, { status: 401 });
    }

    const { amount, method } = await req.json();

    if (!amount || amount < MIN_WITHDRAW) {
      return NextResponse.json(
        { error: `Minimum pengeluaran RM${MIN_WITHDRAW}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id?: string }).id },
      include: { affiliate: true },
    });

    if (!user?.affiliate) {
      return NextResponse.json({ error: "Bukan afiliator" }, { status: 403 });
    }

    if (amount > user.affiliate.balance) {
      return NextResponse.json({ error: "Jumlah melebihi baki" }, { status: 400 });
    }

    // Kunci baki + cipta withdrawal dalam transaksi
    const withdrawal = await prisma.$transaction(async (tx) => {
      const updated = await tx.affiliate.update({
        where: { id: user.affiliate!.id },
        data: { balance: { decrement: amount } },
      });

      const w = await tx.withdrawal.create({
        data: {
          affiliateId: user.affiliate!.id,
          amount,
          method: method || "Pindahan Bank",
          status: "PENDING",
        },
      });

      return { w, balance: updated.balance };
    });

    return NextResponse.json({
      success: true,
      withdrawal: withdrawal.w,
      newBalance: withdrawal.balance,
    });
  } catch (error) {
    console.error("[API /api/affiliate/withdraw POST]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
