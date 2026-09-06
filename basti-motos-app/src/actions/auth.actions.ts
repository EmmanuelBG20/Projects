"use server";

import { headers } from "next/headers";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sendEmailVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function loginAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos." };
  }

  const ip = await getClientIp();
  const rl = checkRateLimit(`login:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);
  if (!rl.success) {
    return { success: false, error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." };
  }

  const result = await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  if (result?.error) {
    return { success: false, error: "Correo o contraseña incorrectos." };
  }

  return { success: true };
}

export async function registerAction(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const ip = await getClientIp();
  const rl = checkRateLimit(`register:${ip}`, RATE_LIMITS.register.limit, RATE_LIMITS.register.windowMs);
  if (!rl.success) {
    return { success: false, error: "Demasiados registros desde esta conexión. Intenta más tarde." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  await sendEmailVerificationEmail(user.email, token);

  return { success: true };
}

export async function forgotPasswordAction(input: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: true }; // no revelar detalles de validación
  }

  const ip = await getClientIp();
  const rl = checkRateLimit(
    `forgot:${ip}`,
    RATE_LIMITS.passwordReset.limit,
    RATE_LIMITS.passwordReset.windowMs
  );
  if (!rl.success) {
    // Igual devolvemos éxito genérico para no filtrar el rate-limit a un atacante,
    // pero simplemente no enviamos el correo.
    return { success: true };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Respuesta idéntica exista o no el usuario, para evitar enumeración de correos.
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendPasswordResetEmail(user.email, token);
  }

  return { success: true };
}

export async function resetPasswordAction(input: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, error: "El enlace expiró o ya fue usado. Solicita uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true };
}
