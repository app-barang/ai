// ============================================================
// Middleware — perlindungan route ikut peranan (role-based)
// ============================================================
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // ---------- AFFILIATE routes ----------
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/afiliator/dashboard") ||
      path.startsWith("/afiliator/link") ||
      path.startsWith("/afiliator/promosi") ||
      path.startsWith("/afiliator/wallet") ||
      path.startsWith("/afiliator/team") ||
      path.startsWith("/afiliator/tetapan")
    ) {
      if (role !== "AFFILIATE" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/daftar-afiliator", req.url));
      }
    }

    // ---------- MERCHANT routes ----------
    if (
      path.startsWith("/merchant/dashboard") ||
      path.startsWith("/merchant/produk") ||
      path.startsWith("/merchant/klik") ||
      path.startsWith("/merchant/jualan") ||
      path.startsWith("/merchant/langganan") ||
      path.startsWith("/merchant/tetapan")
    ) {
      if (role !== "MERCHANT" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/daftar-merchant", req.url));
      }
    }

    // ---------- ADMIN sahaja ----------
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // wajib login untuk semua route yang dipadankan
    },
    pages: {
      signIn: "/masuk",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/afiliator/dashboard/:path*",
    "/afiliator/link/:path*",
    "/afiliator/promosi/:path*",
    "/afiliator/wallet/:path*",
    "/afiliator/team/:path*",
    "/afiliator/tetapan/:path*",
    "/merchant/dashboard/:path*",
    "/merchant/produk/:path*",
    "/merchant/klik/:path*",
    "/merchant/jualan/:path*",
    "/merchant/langganan/:path*",
    "/merchant/tetapan/:path*",
    "/admin/:path*",
  ],
};
