"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { couponSchema, type CouponInput } from "@/lib/validations/coupon";

export async function createCouponAction(input: CouponInput) {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { success: false, error: "Ya existe un cupón con ese código." };

  await prisma.coupon.create({
    data: { ...parsed.data, expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null },
  });
  revalidatePath("/admin/cupones");
  return { success: true };
}

export async function toggleCouponActiveAction(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/cupones");
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  const used = await prisma.couponUsage.findFirst({ where: { couponId: id } });
  if (used) {
    await prisma.coupon.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/cupones");
    return { success: true, softDeleted: true };
  }
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
  return { success: true, softDeleted: false };
}
