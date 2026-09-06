import type { Prisma } from "@prisma/client";
import type { ProductCardData } from "@/types";

type ProductForCard = Prisma.ProductGetPayload<{
  include: { images: true; brand: true; category: true };
}>;

export function toProductCardData(product: ProductForCard): ProductCardData {
  const sortedImages = [...product.images].sort((a, b) => a.order - b.order);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    priceCents: product.priceCents,
    compareAtPriceCents: product.compareAtPriceCents,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
    imageUrl: sortedImages[0]?.url ?? null,
    brandName: product.brand.name,
    categorySlug: product.category.slug,
  };
}
