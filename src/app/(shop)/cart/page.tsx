import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="container py-10 sm:py-14">
      <h1 className="mb-10 font-display text-3xl tracking-tight sm:text-4xl">Tu carrito</h1>
      <CartPageContent />
    </div>
  );
}
