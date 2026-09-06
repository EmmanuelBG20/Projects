import "server-only";
import { prisma } from "@/lib/prisma";
import { availableQuantity } from "@/lib/inventory";
import type { Prisma } from "@prisma/client";
import type { ProductCardData } from "@/components/shop/product-card";

const CARD_INCLUDE = {
  images: { orderBy: { position: "asc" }, take: 2 },
  variants: { select: { color: true } },
} satisfies Prisma.ProductInclude;

type ProductForCard = Prisma.ProductGetPayload<{ include: typeof CARD_INCLUDE }>;

export function toCardData(product: ProductForCard): ProductCardData {
  const colors = new Set(product.variants.map((v) => v.color));
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    isNew: product.isNew,
    image: product.images[0]?.url ?? null,
    secondaryImage: product.images[1]?.url ?? null,
    colorCount: colors.size,
  };
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toCardData);
}

export async function getNewArrivals(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isNew: true },
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toCardData);
}

export async function getTopCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });
}

export interface ShopFilters {
  categorySlug?: string;
  q?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: "relevance" | "price-asc" | "price-desc" | "newest";
  page?: number;
  pageSize?: number;
}

export async function listProducts(filters: ShopFilters) {
  const {
    categorySlug,
    q,
    sizes,
    colors,
    minPrice,
    maxPrice,
    inStockOnly,
    sort = "relevance",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice ?? undefined, lte: maxPrice ?? undefined } }
      : {}),
    ...(sizes?.length || colors?.length
      ? {
          variants: {
            some: {
              ...(sizes?.length ? { size: { in: sizes } } : {}),
              ...(colors?.length ? { color: { in: colors } } : {}),
            },
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "newest"
          ? { createdAt: "desc" }
          : { isFeatured: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: { include: { inventory: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const filtered = inStockOnly
    ? products.filter((p) => p.variants.some((v) => v.inventory && availableQuantity(v.inventory) > 0))
    : products;

  const cards: ProductCardData[] = filtered.map((p) => {
    const colorSet = new Set(p.variants.map((v) => v.color));
    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      isNew: p.isNew,
      image: p.images[0]?.url ?? null,
      secondaryImage: p.images[1]?.url ?? null,
      colorCount: colorSet.size,
    };
  });

  return { products: cards, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getFilterOptions(categorySlug?: string) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
    select: { variants: { select: { size: true, color: true, colorHex: true } }, price: true },
  });

  const sizes = new Set<string>();
  const colors = new Map<string, string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of products) {
    minPrice = Math.min(minPrice, p.price);
    maxPrice = Math.max(maxPrice, p.price);
    for (const v of p.variants) {
      sizes.add(v.size);
      colors.set(v.color, v.colorHex ?? "#111111");
    }
  }

  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "Única"];
  return {
    sizes: [...sizes].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)),
    colors: [...colors.entries()].map(([name, hex]) => ({ name, hex })),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : 0,
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { include: { inventory: true }, orderBy: { position: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: excludeProductId } },
    include: CARD_INCLUDE,
    take: limit,
  });
  return products.map(toCardData);
}
