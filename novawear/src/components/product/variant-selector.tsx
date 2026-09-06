"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { addToCartAction } from "@/lib/actions/cart";
import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/shared/quantity-input";
import { Price } from "@/components/shared/price";
import { cn, formatPrice } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export interface VariantDTO {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  available: number;
  priceOverride: number | null;
}

export function VariantSelector({
  productId,
  name,
  slug,
  price,
  compareAtPrice,
  categoryName,
  variants,
  initialWishlisted,
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  categoryName: string;
  variants: VariantDTO[];
  initialWishlisted: boolean;
}) {
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);
  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const v of variants) if (!map.has(v.color)) map.set(v.color, v.colorHex);
    return [...map.entries()];
  }, [variants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0]?.[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const openCart = useUIStore((s) => s.openCart);
  const queryClient = useQueryClient();
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.size === selectedSize && v.color === selectedColor);
  const available = selectedVariant?.available ?? 0;
  const unitPrice = selectedVariant?.priceOverride ?? price;

  function availabilityFor(size: string, color: string) {
    return variants.find((v) => v.size === size && v.color === color)?.available ?? 0;
  }

  function handleAddToCart(redirectToCheckout = false) {
    if (!selectedVariant) {
      toast.error("Selecciona talla y color.");
      return;
    }
    startTransition(async () => {
      const res = await addToCartAction({ variantId: selectedVariant.id, quantity });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      analytics.addToCart({
        item_id: selectedVariant.id,
        item_name: name,
        price: unitPrice,
        quantity,
        item_category: categoryName,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (redirectToCheckout) {
        router.push("/checkout");
      } else {
        toast.success("Agregado al carrito");
        openCart();
      }
    });
  }

  function handleWishlist() {
    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setWishlisted(Boolean(res.wishlisted));
      if (res.wishlisted) {
        analytics.addToWishlist({ item_id: productId, item_name: name, price });
      }
    });
  }

  return (
    <div className="space-y-6">
      <Price price={unitPrice} compareAtPrice={unitPrice === price ? compareAtPrice : null} size="lg" />

      <div>
        <p className="mb-2.5 text-xs font-medium uppercase tracking-widest">
          Color{selectedColor ? ` — ${selectedColor}` : ""}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {colors.map(([color, hex]) => (
            <button
              key={color}
              title={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "h-9 w-9 rounded-full border transition-all",
                selectedColor === color ? "ring-2 ring-foreground ring-offset-2" : "border-border",
              )}
              style={{ backgroundColor: hex ?? "#111" }}
            >
              <span className="sr-only">{color}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-medium uppercase tracking-widest">Talla</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const stock = selectedColor ? availabilityFor(size, selectedColor) : 1;
            const disabled = stock <= 0;
            return (
              <button
                key={size}
                disabled={disabled}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "h-11 min-w-11 border px-3 text-sm transition-colors",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-input hover:border-foreground",
                  disabled && "cursor-not-allowed border-border text-muted-foreground line-through hover:border-border",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {selectedVariant && (
          <p className={cn("mb-3 text-xs", available <= 5 && available > 0 ? "text-rust" : "text-muted-foreground")}>
            {available <= 0
              ? "Agotado en esta combinación."
              : available <= 5
                ? `Solo quedan ${available} unidades.`
                : "En stock."}
          </p>
        )}
        <div className="flex items-center gap-3">
          <QuantityInput value={quantity} max={Math.max(1, available)} onChange={setQuantity} disabled={available <= 0} />
          <Button
            size="lg"
            className="flex-1"
            disabled={!selectedVariant || available <= 0 || isPending}
            onClick={() => handleAddToCart(false)}
          >
            {available <= 0 ? "Agotado" : "Añadir al carrito"}
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Favoritos"
            onClick={handleWishlist}
            disabled={isPending}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-foreground")} />
          </Button>
        </div>
        <Button
          size="lg"
          variant="outline"
          className="mt-3 w-full"
          disabled={!selectedVariant || available <= 0 || isPending}
          onClick={() => handleAddToCart(true)}
        >
          Comprar ahora
        </Button>
      </div>

      <div className="space-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5" /> Envío gratis en pedidos superiores a {formatPrice(250_000)}.
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" /> Pago 100% seguro con Wompi, Mercado Pago o Stripe.
        </p>
      </div>
    </div>
  );
}
