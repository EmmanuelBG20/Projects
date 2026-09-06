"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/store/ui-store";
import {
  applyCouponAction,
  removeCartItemAction,
  removeCouponAction,
  updateCartItemAction,
} from "@/lib/actions/cart";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuantityInput } from "@/components/shared/quantity-input";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

interface CartItemDTO {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: number;
}

interface CartSummaryDTO {
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  couponCode: string | null;
  couponError?: string;
}

async function fetchCart(): Promise<{ items: CartItemDTO[]; summary: CartSummaryDTO }> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el carrito");
  return res.json();
}

export function CartSheet() {
  const isCartOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const openCart = useUIStore((s) => s.openCart);
  const queryClient = useQueryClient();
  const [couponInput, setCouponInput] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["cart"], queryFn: fetchCart });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const updateQuantity = useMutation({
    mutationFn: (vars: { itemId: string; quantity: number }) => updateCartItemAction(vars),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error);
      invalidate();
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItemAction({ itemId }),
    onSuccess: () => {
      invalidate();
      toast("Producto eliminado del carrito");
    },
  });

  const applyCoupon = useMutation({
    mutationFn: (code: string) => applyCouponAction({ code }),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error);
      else {
        toast.success("Cupón aplicado");
        setCouponInput("");
      }
      invalidate();
    },
  });

  const removeCoupon = useMutation({
    mutationFn: () => removeCouponAction(),
    onSuccess: () => invalidate(),
  });

  const items = data?.items ?? [];
  const summary = data?.summary;
  const remainingForFreeShipping = summary
    ? Math.max(0, FREE_SHIPPING_THRESHOLD - (summary.subtotal - summary.discountTotal))
    : FREE_SHIPPING_THRESHOLD;

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Tu carrito {summary ? `(${summary.itemCount})` : ""}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {isLoading && (
            <p className="py-10 text-center text-sm text-muted-foreground">Cargando…</p>
          )}

          {!isLoading && items.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
              <Button variant="outline" size="sm" onClick={closeCart} asChild>
                <Link href="/shop">Ver catálogo</Link>
              </Button>
            </div>
          )}

          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <Link
                  href={`/product/${item.slug}`}
                  onClick={closeCart}
                  className="relative h-24 w-20 shrink-0 overflow-hidden bg-secondary"
                >
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium leading-tight hover:underline"
                    >
                      {item.name}
                    </Link>
                    <button
                      aria-label="Eliminar"
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.color} · {item.size}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <QuantityInput
                      value={item.quantity}
                      max={Math.max(item.quantity, item.available)}
                      onChange={(q) => updateQuantity.mutate({ itemId: item.id, quantity: q })}
                    />
                    <span className="text-sm font-medium tabular-nums">{formatPrice(item.lineTotal)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {summary && items.length > 0 && (
          <SheetFooter className="flex flex-col gap-4">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-muted-foreground">
                Te faltan {formatPrice(remainingForFreeShipping)} para envío gratis.
              </p>
            ) : (
              <p className="text-xs text-success">Tu pedido tiene envío gratis.</p>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Código de descuento"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="h-10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 shrink-0"
                disabled={!couponInput || applyCoupon.isPending}
                onClick={() => applyCoupon.mutate(couponInput)}
              >
                Aplicar
              </Button>
            </div>

            {summary.couponCode && (
              <div className="flex items-center justify-between text-xs">
                <span>
                  Cupón <strong>{summary.couponCode}</strong>
                  {summary.couponError ? ` — ${summary.couponError}` : " aplicado"}
                </span>
                <button
                  className="text-muted-foreground underline"
                  onClick={() => removeCoupon.mutate()}
                >
                  quitar
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(summary.subtotal)}</span>
              </div>
              {summary.discountTotal > 0 && (
                <div className="flex justify-between text-rust">
                  <span>Descuento</span>
                  <span className="tabular-nums">-{formatPrice(summary.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span className="tabular-nums">
                  {summary.shippingTotal === 0 ? "Gratis" : formatPrice(summary.shippingTotal)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(summary.total)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full" asChild onClick={closeCart}>
              <Link href="/checkout">Ir a pagar</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
