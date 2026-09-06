import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { PAYMENT_PROVIDER_LABELS, type OrderStatus, type PaymentProviderId } from "@/lib/constants";

export const metadata: Metadata = { title: "Detalle del pedido" };

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payments: true, statusHistory: { orderBy: { createdAt: "asc" } }, user: true },
  });
  if (!order) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Pedido</p>
          <h1 className="font-display text-2xl">#{order.orderNumber}</h1>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Cliente</h2>
          <p className="text-sm">
            {order.shippingFirstName} {order.shippingLastName} · {order.email} · {order.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.shippingLine1}, {order.shippingCity}, {order.shippingDepartment}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Productos</h2>
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
          <div className="mt-4 flex justify-between text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Pagos</h2>
          {order.payments.map((p) => (
            <p key={p.id} className="text-sm">
              {PAYMENT_PROVIDER_LABELS[p.provider as PaymentProviderId]} — {p.status} — {formatPrice(p.amount)} — ref:{" "}
              {p.providerRef}
            </p>
          ))}
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Historial</h2>
          <ul className="space-y-2 text-sm">
            {order.statusHistory.map((h) => (
              <li key={h.id} className="flex justify-between text-muted-foreground">
                <span>
                  {h.status} {h.note ? `— ${h.note}` : ""}
                </span>
                <span>{formatDateTime(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div>
        <OrderStatusForm
          orderId={order.id}
          currentStatus={order.status as OrderStatus}
          currentTrackingCarrier={order.trackingCarrier}
          currentTrackingNumber={order.trackingNumber}
        />
      </div>
    </div>
  );
}
