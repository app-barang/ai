// Middleware - lindungi route afiliator & admin
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dapatkan token JWT (set oleh NextAuth callback jwt)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 🔒 Dashboard afiliator — wajib login
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/masuk", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 🔒 Admin — wajib login + role ADMIN
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/masuk", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
