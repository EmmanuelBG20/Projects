"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useCart } from "@/hooks/use-cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { centsToCOP } from "@/lib/money";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const { lines, subtotalCents, setQuantity, remove } = useCart();
  const router = useRouter();

  function goToCheckout() {
    closeDrawer();
    router.push("/checkout");
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/70 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col bg-carbon-800 border-l border-white/10 transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <ShoppingBag size={20} className="text-racing-orange" /> Tu carrito
          </h3>
          <button onClick={closeDrawer} aria-label="Cerrar carrito" className="text-neutral-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-neutral-400">
              <ShoppingBag size={40} className="text-neutral-600" />
              <p>Tu carrito está vacío.</p>
              <Link href="/productos" onClick={closeDrawer} className="btn-ghost mt-2">
                Ver productos
              </Link>
            </div>
          ) : (
            lines.map((line) => (
              <CartItemRow
                key={line.productId}
                line={line}
                onQuantityChange={(q) => setQuantity(line.productId, q)}
                onRemove={() => remove(line.productId)}
              />
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-neutral-300">Subtotal</span>
              <span className="text-lg font-bold text-white">{centsToCOP(subtotalCents)}</span>
            </div>
            <button onClick={goToCheckout} className="btn-primary w-full">
              Finalizar compra
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
