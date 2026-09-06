import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS, type OrderStatus, type PaymentProviderId } from "@/lib/constants";

export const metadata: Metadata = { title: "Detalle del pedido" };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  // Authorization boundary: an order only renders for the user who placed it.
  // A wrong id or someone else's order id both resolve to a plain 404 — never
  // leak whether the order exists to a user who doesn't own it.
  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Pedido</p>
          <h2 className="font-display text-2xl">#{order.orderNumber}</h2>
        </div>
        <Badge variant="outline">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
      </div>

      <section>
        <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Seguimiento</h3>
        <ol className="space-y-3 border-l border-border pl-5">
          {order.statusHistory.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[25px] top-1 h-2 w-2 rounded-full bg-foreground" />
              <p className="text-sm font-medium">{ORDER_STATUS_LABELS[h.status as OrderStatus] ?? h.status}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(h.createdAt)}</p>
              {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
            </li>
          ))}
        </ol>
        {order.trackingNumber && (
          <p className="mt-4 text-sm">
            Guía: <strong>{order.trackingNumber}</strong> ({order.trackingCarrier})
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Productos</h3>
        <ul className="divide-y divide-border border-y border-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>
                {item.productName} ({item.variantColor}, {item.variantSize}) x{item.quantity}
              </span>
              <span className="tabular-nums">{formatPrice(item.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-rust">
              <span>Descuento {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span className="tabular-nums">-{formatPrice(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Envío</span>
            <span className="tabular-nums">{order.shippingTotal === 0 ? "Gratis" : formatPrice(order.shippingTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Envío</h3>
          <p className="text-sm">
            {order.shippingFirstName} {order.shippingLastName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
            <br />
            {order.shippingCity}, {order.shippingDepartment}
          </p>
        </section>
        <section>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Pago</h3>
          {order.payments.map((p) => (
            <p key={p.id} className="text-sm">
              {PAYMENT_PROVIDER_LABELS[p.provider as PaymentProviderId]} — {p.status}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
