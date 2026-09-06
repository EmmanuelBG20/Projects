"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/Toast";
import type { ProductCardData } from "@/types";

export function AddToCartPanel({ product }: { product: ProductCardData }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { push } = useToast();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const outOfStock = product.stock <= 0;

  async function handleAdd() {
    await addToCart(product, quantity);
    push(`${quantity} × ${product.name} agregado al carrito`, "success");
    openDrawer();
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 rounded-full border border-white/10 px-2 py-1">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Disminuir cantidad"
          className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-medium text-white">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(q + 1, product.stock, 20))}
          disabled={quantity >= product.stock}
          aria-label="Aumentar cantidad"
          className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 sm:flex-none">
        <ShoppingCart size={18} /> {outOfStock ? "Agotado" : "Agregar al carrito"}
      </button>

      <p className="w-full text-sm text-neutral-400">
        {outOfStock ? "Sin stock disponible" : `${product.stock} unidades disponibles`}
      </p>
    </div>
  );
}
