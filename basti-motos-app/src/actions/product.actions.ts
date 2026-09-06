"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export async function createProductAction(input: ProductInput) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const existingSlug = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) return { success: false, error: "Ya existe un producto con ese slug." };
  const existingSku = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existingSku) return { success: false, error: "Ya existe un producto con ese SKU." };

  const { relatedProductIds, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      relatedTo: { connect: relatedProductIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { success: true, productId: product.id };
}

export async function updateProductAction(productId: string, input: ProductInput) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const conflictingSlug = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: productId } },
  });
  if (conflictingSlug) return { success: false, error: "Ya existe otro producto con ese slug." };

  const { relatedProductIds, ...data } = parsed.data;

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      relatedTo: { set: relatedProductIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${parsed.data.slug}`);
  return { success: true };
}

export async function toggleProductActiveAction(productId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();

  const usedInOrders = await prisma.orderItem.findFirst({ where: { productId } });
  if (usedInOrders) {
    // No se borra un producto con historial de pedidos: se desactiva para
    // conservar la integridad de las órdenes ya facturadas.
    await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
    revalidatePath("/admin/productos");
    return { success: true, softDeleted: true };
  }

  const images = await prisma.productImage.findMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } });

  for (const image of images) {
    await deleteCloudinaryImage(image.publicId).catch(() => undefined);
  }

  revalidatePath("/admin/productos");
  return { success: true, softDeleted: false };
}

export async function updateStockAction(productId: string, stock: number) {
  await requireAdmin();
  if (stock < 0) return { success: false, error: "El stock no puede ser negativo." };

  await prisma.product.update({ where: { id: productId }, data: { stock } });
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function addProductImageAction(productId: string, url: string, publicId: string) {
  await requireAdmin();
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({ data: { productId, url, publicId, order: count } });
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function deleteProductImageAction(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Imagen no encontrada." };

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteCloudinaryImage(image.publicId).catch(() => undefined);

  revalidatePath("/admin/productos");
  return { success: true };
}
