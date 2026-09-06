import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { centsToCOP } from "@/lib/money";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";

type Params = Promise<{ id: string }>;

export default async function PedidoDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findFirst({
    where: { id, userId: session!.user.id },
    include: { items: true, address: true, payment: true },
  });

  if (!order) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title mb-0">Pedido #{order.id.slice(0, 8)}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${ORDER_STATUS_STYLES[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card divide-y divide-white/10 lg:col-span-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-white">{item.productName}</p>
                <p className="text-sm text-neutral-500">SKU {item.sku} · {item.quantity} unidad(es)</p>
              </div>
              <p className="font-semibold text-white">{centsToCOP(item.unitPriceCents * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="mb-3 font-display font-bold text-white">Resumen</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{centsToCOP(order.subtotalCents)}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-neon-green">
                  <span>Descuento</span>
                  <span>-{centsToCOP(order.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Envío</span>
                <span>{order.shippingCents === 0 ? "Gratis" : centsToCOP(order.shippingCents)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
                <span>Total</span>
                <span>{centsToCOP(order.totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="mb-3 font-display font-bold text-white">Dirección de envío</h2>
            <p className="text-sm text-neutral-300">{order.address.fullName}</p>
            <p className="text-sm text-neutral-500">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""} — {order.address.city}, {order.address.department}
            </p>
            <p className="text-sm text-neutral-500">{order.address.phone}</p>
          </div>

          {order.payment && (
            <div className="glass-card p-5">
              <h2 className="mb-3 font-display font-bold text-white">Pago</h2>
              <p className="text-sm text-neutral-400">Referencia: {order.payment.reference}</p>
              <p className="text-sm text-neutral-400">Estado: {order.payment.status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
