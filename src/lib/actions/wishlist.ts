"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function toggleWishlistAction(productId: string): Promise<{ error?: string; wishlisted?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Inicia sesión para guardar favoritos." };

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { wishlisted: false };
  }

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  revalidatePath("/account/wishlist");
  return { wishlisted: true };
}

export async function getWishlistedProductIds(productIds: string[]): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const items = await prisma.wishlistItem.findMany({
    where: { productId: { in: productIds }, wishlist: { userId: user.id } },
    select: { productId: true },
  });
  return new Set(items.map((i) => i.productId));
}
