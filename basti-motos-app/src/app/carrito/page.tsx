"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { centsToCOP } from "@/lib/money";

export default function CarritoPage() {
  const { lines, subtotalCents, setQuantity, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag size={48} className="text-neutral-600" />
        <h1 className="section-title">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-primary">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <h1 className="section-title">Tu carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="glass-card divide-y divide-white/10 p-5 lg:col-span-2">
          {lines.map((line) => (
            <CartItemRow
              key={line.productId}
              line={line}
              onQuantityChange={(q) => setQuantity(line.productId, q)}
              onRemove={() => remove(line.productId)}
            />
          ))}
        </div>

        <div className="glass-card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Resumen</h2>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 text-neutral-300">
            <span>Subtotal</span>
            <span className="font-semibold text-white">{centsToCOP(subtotalCents)}</span>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            El envío y los descuentos se calculan en el siguiente paso.
          </p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Continuar a pago
          </Link>
        </div>
      </div>
    </div>
  );
}
