"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { adjustVariantStock, restockVariant } from "@/lib/inventory";

const restockSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  reason: z.string().trim().max(200).optional(),
});

const adjustSchema = z.object({
  variantId: z.string().min(1),
  newQuantity: z.coerce.number().int().min(0),
  reason: z.string().trim().max(200).optional(),
});

export async function restockVariantAction(input: unknown): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const parsed = restockSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  await restockVariant(parsed.data.variantId, parsed.data.quantity, {
    reason: parsed.data.reason || "Entrada de inventario",
    userId: user.id,
  });
  revalidatePath("/admin/inventory");
  return {};
}

export async function adjustVariantStockAction(input: unknown): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  await adjustVariantStock(parsed.data.variantId, parsed.data.newQuantity, {
    reason: parsed.data.reason || "Ajuste manual",
    userId: user.id,
  });
  revalidatePath("/admin/inventory");
  return {};
}
