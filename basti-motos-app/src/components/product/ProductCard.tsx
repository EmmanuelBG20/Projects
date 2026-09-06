"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { centsToPlainCOP } from "@/lib/money";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/Toast";
import { useCartStore } from "@/store/cart-store";
import type { ProductCardData } from "@/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addToCart } = useCart();
  const { push } = useToast();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [imageBroken, setImageBroken] = useState(false);

  const outOfStock = product.stock <= 0;

  async function handleAdd() {
    if (outOfStock) return;
    await addToCart(product, 1);
    push(`${product.name} se agregó al carrito`, "success");
    openDrawer();
  }

  return (
    <article className="glass-card group flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
      <Link href={`/productos/${product.slug}`} className="relative block aspect-square overflow-hidden bg-carbon-700">
        {product.imageUrl && !imageBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            <ShoppingCart size={40} />
          </div>
        )}
        {product.tags.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.tags.map((tag) => (
              <Badge key={tag} tag={tag} />
            ))}
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-carbon-900 px-3 py-1 text-xs font-semibold text-white">Agotado</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brandName}</p>
        <Link href={`/productos/${product.slug}`} className="mt-1 line-clamp-2 font-medium text-white hover:text-racing-orange">
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <RatingStars rating={product.rating} size={14} />
          <span className="text-xs text-neutral-500">({product.reviewCount})</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">{centsToPlainCOP(product.priceCents)}</span>
          {product.compareAtPriceCents && (
            <span className="text-sm text-neutral-500 line-through">
              {centsToPlainCOP(product.compareAtPriceCents)}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-primary mt-4 w-full py-2.5 text-sm disabled:from-carbon-600 disabled:to-carbon-600 disabled:shadow-none"
        >
          <ShoppingCart size={16} /> {outOfStock ? "Agotado" : "Agregar"}
        </button>
      </div>
    </article>
  );
}
