"use client";

import { ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui-store";

interface CartResponse {
  summary: { itemCount: number };
}

async function fetchCart(): Promise<CartResponse> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) return { summary: { itemCount: 0 } };
  return res.json();
}

export function CartTrigger() {
  const openCart = useUIStore((s) => s.openCart);
  const { data } = useQuery({ queryKey: ["cart"], queryFn: fetchCart });
  const count = data?.summary.itemCount ?? 0;

  return (
    <button
      aria-label="Abrir carrito"
      onClick={openCart}
      className="relative flex h-10 w-10 items-center justify-center text-foreground transition-opacity hover:opacity-60"
    >
      <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
          {count}
        </span>
      )}
    </button>
  );
}
