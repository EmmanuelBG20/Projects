import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { CartSummary } from "@/lib/cart";

interface Line {
  id: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  quantity: number;
  lineTotal: number;
}

export function OrderSummary({ items, summary }: { items: Line[]; summary: CartSummary }) {
  return (
    <div className="border border-border bg-secondary/30 p-6">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-secondary">
              {item.image && <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />}
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.color} · {item.size}
              </p>
            </div>
            <span className="text-sm tabular-nums">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatPrice(summary.subtotal)}</span>
        </div>
        {summary.discountTotal > 0 && (
          <div className="flex justify-between text-rust">
            <span>Descuento {summary.couponCode ? `(${summary.couponCode})` : ""}</span>
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
    </div>
  );
}
