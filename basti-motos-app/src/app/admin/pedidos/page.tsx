import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { centsToCOP } from "@/lib/money";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

type SearchParams = Promise<{ estado?: string }>;

export default async function AdminPedidosPage({ searchParams }: { searchParams: SearchParams }) {
  const { estado } = await searchParams;

  const orders = await prisma.order.findMany({
    where: estado ? { status: estado as OrderStatus } : undefined,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const statuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

  return (
    <div>
      <h1 className="section-title">Pedidos</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!estado ? "bg-racing-orange text-white" : "bg-white/5 text-neutral-400 hover:text-white"}`}
        >
          Todos
        </Link>
        {statuses.map((status) => (
          <Link
            key={status}
            href={`/admin/pedidos?estado=${status}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${estado === status ? "bg-racing-orange text-white" : "bg-white/5 text-neutral-400 hover:text-white"}`}
          >
            {ORDER_STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-neutral-400">
            <tr>
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Productos</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5">
                <td className="p-4">
                  <Link href={`/admin/pedidos/${order.id}`} className="font-medium text-white hover:text-racing-orange">
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="p-4 text-neutral-300">{order.user.name}</td>
                <td className="p-4 text-neutral-300">{order.items.length}</td>
                <td className="p-4 text-neutral-300">{centsToCOP(order.totalCents)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="p-4 text-neutral-500">{order.createdAt.toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-neutral-400">No hay pedidos con ese filtro.</p>}
      </div>
    </div>
  );
}
