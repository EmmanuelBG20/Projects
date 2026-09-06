"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo").max(100),
});

export async function updateProfileAction(input: { name: string }) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Debes iniciar sesión." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } });
  revalidatePath("/mi-cuenta/perfil");
  return { success: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Debes iniciar sesión." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Tu contraseña actual no es correcta." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
