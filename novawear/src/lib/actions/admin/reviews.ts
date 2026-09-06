"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

async function recomputeRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

export async function setReviewApprovalAction(reviewId: string, isApproved: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const review = await prisma.review.update({ where: { id: reviewId }, data: { isApproved } });
  await recomputeRating(review.productId);
  revalidatePath("/admin/reviews");
  return {};
}

export async function deleteReviewAction(reviewId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const review = await prisma.review.delete({ where: { id: reviewId } });
  await recomputeRating(review.productId);
  revalidatePath("/admin/reviews");
  return {};
}
