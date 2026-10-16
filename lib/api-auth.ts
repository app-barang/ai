// ============================================================
// lib/api-auth.ts — Helper pengesahan sesi + role untuk API
// ============================================================
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  affiliateId: string | null;
  merchantId: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export function unauthorized(msg = "Sila log masuk untuk teruskan") {
  return NextResponse.json({ error: msg }, { status: 401 });
}

export function forbidden(msg = "Anda tidak mempunyai akses") {
  return NextResponse.json({ error: msg }, { status: 403 });
}

export function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

/** Pastikan sesi milik afiliator; pulangkan affiliateId */
export async function requireAffiliate(): Promise<
  { ok: true; user: SessionUser; affiliateId: string } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, response: unauthorized() };
  if (!user.affiliateId) return { ok: false, response: forbidden("Akaun ini bukan afiliator") };
  return { ok: true, user, affiliateId: user.affiliateId };
}

/** Pastikan sesi milik merchant; pulangkan merchantId */
export async function requireMerchant(): Promise<
  { ok: true; user: SessionUser; merchantId: string } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, response: unauthorized() };
  if (!user.merchantId) return { ok: false, response: forbidden("Akaun ini bukan merchant") };
  return { ok: true, user, merchantId: user.merchantId };
}

/** Pastikan sesi milik admin */
export async function requireAdmin(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, response: unauthorized() };
  if (user.role !== "ADMIN") return { ok: false, response: forbidden("Khusus pentadbir") };
  return { ok: true, user };
}
