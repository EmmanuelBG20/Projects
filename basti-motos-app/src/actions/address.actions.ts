"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema, type AddressInput } from "@/lib/validations/address";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Debes iniciar sesión.");
  return session.user;
}

export async function createAddressAction(input: AddressInput) {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({ data: { ...parsed.data, userId: user.id } });
  revalidatePath("/mi-cuenta/direcciones");
  return { success: true, addressId: address.id };
}

export async function updateAddressAction(addressId: string, input: AddressInput) {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const existing = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!existing) return { success: false, error: "Dirección no encontrada." };

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  await prisma.address.update({ where: { id: addressId }, data: parsed.data });
  revalidatePath("/mi-cuenta/direcciones");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();
  const existing = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!existing) return { success: false, error: "Dirección no encontrada." };

  await prisma.address.delete({ where: { id: addressId } });
  revalidatePath("/mi-cuenta/direcciones");
  return { success: true };
}
