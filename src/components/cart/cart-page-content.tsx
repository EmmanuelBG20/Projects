"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import {
  applyCouponAction,
  removeCartItemAction,
  removeCouponAction,
  updateCartItemAction,
} from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuantityInput } from "@/components/shared/quantity-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

interface CartItemDTO {
  id: string;
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

export function CartPageContent() {
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
      toast("Producto eliminado");
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
  const removeCoupon = useMutation({ mutationFn: () => removeCouponAction(), onSuccess: invalidate });

  if (isLoading) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const items = data?.items ?? [];
  const summary = data?.summary;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Tu carrito está vacío"
        description="Explora la colección y encuentra tus próximos esenciales."
        action={
          <Button asChild className="mt-2">
            <Link href="/shop">Ver catálogo</Link>
          </Button>
        }
      />
    );
  }

  const remainingForFreeShipping = summary
    ? Math.max(0, FREE_SHIPPING_THRESHOLD - (summary.subtotal - summary.discountTotal))
    : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-6">
            <Link href={`/product/${item.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden bg-secondary">
              {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />}
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {item.color} · {item.size}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.unitPrice)} c/u</p>
                </div>
                <button
                  aria-label="Eliminar"
                  onClick={() => removeItem.mutate(item.id)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
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

      {summary && (
        <div className="h-fit space-y-5 border border-border p-6">
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
            />
            <Button
              type="button"
              variant="outline"
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
              <button className="text-muted-foreground underline" onClick={() => removeCoupon.mutate()}>
                quitar
              </button>
            </div>
          )}

          <div className="space-y-2 text-sm">
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
              <span className="tabular-nums">{summary.shippingTotal === 0 ? "Gratis" : formatPrice(summary.shippingTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(summary.total)}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" asChild>
            <Link href="/checkout">Ir a pagar</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
