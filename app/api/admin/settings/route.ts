import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { withDbRetry } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const user = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { id: authz.user.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
      })
    );

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak dijumpai" }, { status: 404 });
    }

    return NextResponse.json({ admin: user });
  } catch (error) {
    console.error("[API /api/admin/settings GET]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authz = await requireAdmin();
    if (!authz.ok) return authz.response;

    const body = await req.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Kata laluan semasa dan baharu diperlukan" },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Kata laluan baharu minimum 8 aksara" },
        { status: 400 }
      );
    }

    const user = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { id: authz.user.id },
        select: { id: true, password: true },
      })
    );

    if (!user?.password) {
      return NextResponse.json(
        { error: "Akaun ini tidak menggunakan kata laluan (OAuth)" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Kata laluan semasa tidak tepat" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await withDbRetry(() =>
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    );

    return NextResponse.json({ success: true, message: "Kata laluan berjaya dikemas kini" });
  } catch (error) {
    console.error("[API /api/admin/settings PUT]", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}
