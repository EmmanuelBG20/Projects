"use client";

import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { addToCartAction, updateCartItemAction, removeCartItemAction } from "@/actions/cart.actions";
import type { ProductCardData } from "@/types";

/**
 * Punto único desde el que la UI toca el carrito, sin importar si el
 * visitante es invitado (solo localStorage) o un usuario autenticado
 * (localStorage + base de datos). El componente que llama a estas funciones
 * no necesita saber cuál de los dos casos aplica.
 */
export function useCart() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const lines = useCartStore((s) => s.lines);
  const addOrUpdateLine = useCartStore((s) => s.addOrUpdateLine);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  async function addToCart(product: ProductCardData, quantity = 1) {
    addOrUpdateLine({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      unitPriceCents: product.priceCents,
      quantity,
      stock: product.stock,
      lineTotalCents: product.priceCents * quantity,
    });

    if (isAuthenticated) {
      await addToCartAction(product.id, quantity);
    }
  }

  async function setQuantity(productId: string, quantity: number) {
    updateQuantity(productId, quantity);
    if (isAuthenticated) {
      await updateCartItemAction(productId, quantity);
    }
  }

  async function remove(productId: string) {
    removeLine(productId);
    if (isAuthenticated) {
      await removeCartItemAction(productId);
    }
  }

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  return { lines, itemCount, subtotalCents, addToCart, setQuantity, remove };
}
