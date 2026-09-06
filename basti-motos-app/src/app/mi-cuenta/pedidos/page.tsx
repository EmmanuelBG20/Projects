import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { centsToCOP } from "@/lib/money";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";

export default async function MisPedidosPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="section-title">Mis pedidos</h1>

      {orders.length === 0 ? (
        <p className="glass-card p-6 text-neutral-400">Aún no has realizado pedidos.</p>
      ) : (
        <div className="glass-card divide-y divide-white/10">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/mi-cuenta/pedidos/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">Pedido #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-neutral-500">
                  {order.createdAt.toLocaleDateString("es-CO")} · {order.items.length} producto(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <span className="font-semibold text-white">{centsToCOP(order.totalCents)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
