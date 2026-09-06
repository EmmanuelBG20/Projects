import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Favoritos" };

export default async function WishlistPage() {
  const user = await requireUser();
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const items = wishlist?.items.filter((i) => i.product.status === "ACTIVE") ?? [];

  if (items.length === 0) {
    return <EmptyState icon={Heart} title="No tienes favoritos todavía" description="Guarda productos para verlos aquí." />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          product={{
            slug: item.product.slug,
            name: item.product.name,
            price: item.product.price,
            compareAtPrice: item.product.compareAtPrice,
            isNew: item.product.isNew,
            image: item.product.images[0]?.url ?? null,
          }}
        />
      ))}
    </div>
  );
}
