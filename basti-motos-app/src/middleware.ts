import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// El middleware corre en el Edge Runtime de Next.js, que no soporta Prisma
// ni bcrypt. Por eso construye su propia instancia de Auth.js a partir de
// `authConfig` (sin el provider de Credentials), que solo sabe leer y
// verificar el JWT ya emitido — no necesita tocar la base de datos.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = nextUrl.pathname.startsWith("/mi-cuenta");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const url = new URL("/iniciar-sesion", nextUrl);
      url.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAccountRoute && !isLoggedIn) {
    const url = new URL("/iniciar-sesion", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta/:path*"],
};
