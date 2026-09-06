"use server";

import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";
import { mergeGuestCartIntoUser } from "@/lib/cart";
import { CART_COOKIE } from "@/lib/constants";

async function mergeGuestCartForEmail(email: string) {
  const guestToken = cookies().get(CART_COOKIE)?.value;
  if (!guestToken) return;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return;
  await mergeGuestCartIntoUser(guestToken, user.id);
  cookies().delete(CART_COOKIE);
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const ip = ipFromHeaders(headers());
  const limited = rateLimit(`login-ip:${ip}`, { limit: 20, windowMs: 5 * 60_000 });
  if (!limited.success) {
    return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    await mergeGuestCartForEmail(parsed.data.email.toLowerCase());
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const ip = ipFromHeaders(headers());
  const limited = rateLimit(`register-ip:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!limited.success) {
    return { error: "Demasiados intentos. Intenta más tarde." };
  }

  const { name, email, password, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "Ya existe una cuenta con este correo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      phone: phone || null,
      role: "CUSTOMER",
    },
  });

  try {
    await signIn("credentials", { email: normalizedEmail, password, redirect: false });
    await mergeGuestCartForEmail(normalizedEmail);
  } catch {
    // Account was created; if the auto sign-in throws for any reason the
    // user can still sign in manually from /login.
  }
  return {};
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
