"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createReviewSchema } from "@/lib/validations/review";
import { rateLimit } from "@/lib/rate-limit";

export async function createReviewAction(input: unknown): Promise<{ error?: string }> {
  const user = await requireUser();

  const limited = rateLimit(`review:${user.id}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!limited.success) return { error: "Demasiadas reseñas en poco tiempo. Intenta más tarde." };

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const { productId, rating, title, comment } = parsed.data;

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId: user.id } },
  });
  if (existing) return { error: "Ya escribiste una reseña para este producto." };

  const purchase = await prisma.orderItem.findFirst({
    where: { productId, order: { userId: user.id, status: "DELIVERED" } },
  });

  await prisma.review.create({
    data: {
      productId,
      userId: user.id,
      rating,
      title: title || null,
      comment,
      isVerifiedPurchase: Boolean(purchase),
    },
  });

  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  const product = await prisma.product.update({
    where: { id: productId },
    data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
    select: { slug: true },
  });

  revalidatePath(`/product/${product.slug}`);
  return {};
}
