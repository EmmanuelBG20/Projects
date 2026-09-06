import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Consume el token enviado por correo al registrarse. La verificación de
 * correo es informativa (no bloquea el inicio de sesión): el usuario ya
 * puede comprar sin verificar, esto solo marca `emailVerifiedAt`.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${appUrl}/iniciar-sesion?verificacion=invalida`);
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl}/iniciar-sesion?verificacion=invalida`);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(`${appUrl}/iniciar-sesion?verificacion=exitosa`);
}
