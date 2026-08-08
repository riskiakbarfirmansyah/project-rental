import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Next.js 16 Proxy (pengganti Middleware) untuk proteksi halaman /admin.
 * Berjalan di Edge Runtime (server-side) sebelum halaman dirender —
 * tidak ada flash/flicker di browser.
 *
 * Jika token tidak ada atau tidak valid → redirect ke /login dan hapus cookie.
 */

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_change_me"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;

  // Tidak ada token → redirect ke login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Token valid tapi bukan admin → redirect ke login
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // OK — lanjutkan request
    return NextResponse.next();
  } catch {
    // Token expired atau tidak valid → hapus cookie dan redirect ke login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  // Hanya jalankan proxy untuk path /admin dan semua sub-path-nya
  matcher: ["/admin", "/admin/:path*"],
};
