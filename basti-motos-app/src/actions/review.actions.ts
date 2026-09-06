"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Cuéntanos un poco más").max(500),
});

export async function createReviewAction(input: z.infer<typeof reviewSchema>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Debes iniciar sesión para opinar." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: parsed.data.productId, userId: session.user.id } },
  });
  if (existing) {
    return { success: false, error: "Ya dejaste una reseña para este producto." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        productId: parsed.data.productId,
        userId: session.user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    const agg = await tx.review.aggregate({
      where: { productId: parsed.data.productId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.product.update({
      where: { id: parsed.data.productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });
  });

  revalidatePath(`/productos`);
  return { success: true };
}
