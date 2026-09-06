"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { categorySchema, brandSchema, type CategoryInput, type BrandInput } from "@/lib/validations/product";

export async function createCategoryAction(input: CategoryInput) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, error: "Ya existe una categoría con ese slug." };

  await prisma.category.create({ data: parsed.data });
  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function updateCategoryAction(id: string, input: CategoryInput) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };

  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const inUse = await prisma.product.findFirst({ where: { categoryId: id } });
  if (inUse) return { success: false, error: "No puedes borrar una categoría con productos asociados." };

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function createBrandAction(input: BrandInput) {
  await requireAdmin();
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };

  const existing = await prisma.brand.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, error: "Ya existe una marca con ese slug." };

  await prisma.brand.create({ data: parsed.data });
  revalidatePath("/admin/marcas");
  return { success: true };
}

export async function updateBrandAction(id: string, input: BrandInput) {
  await requireAdmin();
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };

  await prisma.brand.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/marcas");
  return { success: true };
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  const inUse = await prisma.product.findFirst({ where: { brandId: id } });
  if (inUse) return { success: false, error: "No puedes borrar una marca con productos asociados." };

  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/marcas");
  return { success: true };
}
