"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { couponInputSchema } from "@/lib/validations/coupon";

export async function createCouponAction(input: unknown): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = couponInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const data = parsed.data;

  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) return { error: "Ya existe un cupón con ese código." };

  await prisma.coupon.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      minSubtotal: data.minSubtotal ?? null,
      maxUses: data.maxUses ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive ?? true,
    },
  });

  revalidatePath("/admin/coupons");
  return {};
}

export async function toggleCouponActiveAction(couponId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) return { error: "Cupón no encontrado." };
  await prisma.coupon.update({ where: { id: couponId }, data: { isActive: !coupon.isActive } });
  revalidatePath("/admin/coupons");
  return {};
}
