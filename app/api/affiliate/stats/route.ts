// Stats afiliator - API
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

    const affiliateId = user.affiliate.id;

    // Agregat dari link afiliasi
    const links = await prisma.affLink.findMany({
      where: { affiliateId },
      select: { clicks: true, conversions: true, earnings: true },
    });

    const totalClicks = links.reduce((a, l) => a + l.clicks, 0);
    const totalConversions = links.reduce((a, l) => a + l.conversions, 0);
    const totalEarnings = links.reduce((a, l) => a + l.earnings, 0);

    return NextResponse.json({
      totalClicks,
      totalConversions,
      totalEarnings,
      balance: user.affiliate.balance,
      conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
      commissionRate: user.affiliate.commissionRate,
      status: user.affiliate.status,
    });
  } catch (error) {
    console.error("[API /api/affiliate/stats]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
