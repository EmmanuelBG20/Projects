import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe auth instance (no Prisma) — used only to read the JWT for
// route gating. Real authentication happens in src/lib/auth.ts (Node runtime).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = nextUrl.pathname.startsWith("/account");

  if (isAdminRoute) {
    if (!req.auth) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN" && role !== "MANAGER") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAccountRoute && !req.auth) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
