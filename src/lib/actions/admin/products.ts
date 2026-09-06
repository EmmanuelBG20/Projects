"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { productInputSchema } from "@/lib/validations/product";

export interface ProductActionState {
  error?: string;
}

export async function createProductAction(input: unknown): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const data = parsed.data;

  const [slugTaken, skuTaken] = await Promise.all([
    prisma.product.findUnique({ where: { slug: data.slug } }),
    prisma.product.findUnique({ where: { sku: data.sku } }),
  ]);
  if (slugTaken) return { error: "Ya existe un producto con ese slug." };
  if (skuTaken) return { error: "Ya existe un producto con ese SKU." };

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      categoryId: data.categoryId,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      description: data.description,
      story: data.story || null,
      material: data.material || null,
      careInstructions: data.careInstructions || null,
      status: data.status,
      isFeatured: Boolean(data.isFeatured),
      isNew: Boolean(data.isNew),
      images: { create: data.images.map((url, i) => ({ url, position: i })) },
      variants: {
        create: data.variants.map((v, i) => ({
          sku: `${data.sku}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, "-"),
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          position: i,
          inventory: { create: { quantity: v.quantity, reserved: 0 } },
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(productId: string, input: unknown): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const data = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { include: { inventory: true } } },
  });
  if (!existing) return { error: "Producto no encontrado." };

  const conflict = await prisma.product.findFirst({
    where: { slug: data.slug, id: { not: productId } },
  });
  if (conflict) return { error: "Ya existe otro producto con ese slug." };

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        description: data.description,
        story: data.story || null,
        material: data.material || null,
        careInstructions: data.careInstructions || null,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
        isNew: Boolean(data.isNew),
      },
    });

    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productImage.createMany({
      data: data.images.map((url, i) => ({ productId, url, position: i })),
    });

    const keepVariantIds = data.variants.filter((v) => v.id).map((v) => v.id!) as string[];
    await tx.productVariant.deleteMany({ where: { productId, id: { notIn: keepVariantIds } } });

    for (const [i, v] of data.variants.entries()) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { size: v.size, color: v.color, colorHex: v.colorHex || null, position: i },
        });
        await tx.inventory.upsert({
          where: { variantId: v.id },
          update: { quantity: v.quantity },
          create: { variantId: v.id, quantity: v.quantity, reserved: 0 },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId,
            sku: `${data.sku}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, "-"),
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || null,
            position: i,
            inventory: { create: { quantity: v.quantity, reserved: 0 } },
          },
        });
      }
    }
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/product/${data.slug}`);
  return {};
}

export async function toggleProductStatusAction(productId: string): Promise<ProductActionState> {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Producto no encontrado." };

  await prisma.product.update({
    where: { id: productId },
    data: { status: product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" },
  });
  revalidatePath("/admin/products");
  return {};
}

export async function deleteProductAction(productId: string): Promise<ProductActionState> {
  await requireAdmin();
  const usedInOrders = await prisma.orderItem.findFirst({ where: { productId } });
  if (usedInOrders) {
    // Preserve order history integrity — archive instead of hard-deleting a
    // product that already has sales attached to it.
    await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
    revalidatePath("/admin/products");
    return { error: "El producto tiene pedidos asociados; se archivó en lugar de eliminarse." };
  }

  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  return {};
}
