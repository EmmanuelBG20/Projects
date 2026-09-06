import type { Prisma } from "@prisma/client";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; category: true; brand: true };
}>;

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  imageUrl: string | null;
  brandName: string;
  categorySlug: string;
};

export type CartLineView = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  stock: number;
  lineTotalCents: number;
};

export type CartSummary = {
  lines: CartLineView[];
  subtotalCents: number;
  itemCount: number;
};

export type GuestCartItem = {
  productId: string;
  quantity: number;
};
