import { NextRequest, NextResponse } from "next/server";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 20)));

    const where = { ...(status ? { status: status as never } : {}) };

    const [items, total] = await Promise.all([
      withDbRetry(() =>
        prisma.payout.findMany({
          where,
          orderBy: { requestedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            amount: true,
            method: true,
            accountInfo: true,
            status: true,
            requestedAt: true,
            processedAt: true,
            completedAt: true,
            notes: true,
            reference: true,
            affiliate: {
              select: {
                id: true,
                username: true,
                bankName: true,
                bankAccount: true,
                balance: true,
                pendingBalance: true,
              },
            },
          },
        })
      ),
      withDbRetry(() => prisma.payout.count({ where })),
    ]);

    return NextResponse.json({
      payouts: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error("[API /api/admin/payouts GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const body = await req.json().catch(() => ({}));
    const { payoutId, action, notes, reference } = body;
    if (!payoutId || !action) {
      return NextResponse.json(
        { error: "payoutId dan action diperlukan" },
        { status: 400 }
      );
    }

    const payout = await withDbRetry(() =>
      prisma.payout.findUnique({ where: { id: payoutId } })
    );
    if (!payout) {
      return NextResponse.json({ error: "Payout tidak dijumpai" }, { status: 404 });
    }
    if (payout.status !== "PENDING" && payout.status !== "PROCESSING") {
      return NextResponse.json(
        { error: "Payout ini sudah diproses" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "approve" || action === "complete") {
      const [updated] = await withDbRetry(() =>
        prisma.$transaction([
          prisma.payout.update({
            where: { id: payoutId },
            data: {
              status: "COMPLETED",
              processedAt: now,
              completedAt: now,
              notes: notes ?? null,
              reference: reference ?? null,
            },
          }),
          prisma.affiliate.update({
            where: { id: payout.affiliateId },
            data: { pendingBalance: { decrement: payout.amount } },
          }),
        ])
      );
      return NextResponse.json({ success: true, payout: updated });
    }

    if (action === "reject") {
      const [updated] = await withDbRetry(() =>
        prisma.$transaction([
          prisma.payout.update({
            where: { id: payoutId },
            data: {
              status: "REJECTED",
              processedAt: now,
              notes: notes ?? "Ditolak oleh admin",
            },
          }),
          prisma.affiliate.update({
            where: { id: payout.affiliateId },
            data: {
              balance: { increment: payout.amount },
              pendingBalance: { decrement: payout.amount },
            },
          }),
        ])
      );
      return NextResponse.json({ success: true, payout: updated });
    }

    return NextResponse.json(
      { error: "action tidak sah (approve/reject)" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API /api/admin/payouts PUT]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
