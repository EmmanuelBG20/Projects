import { prisma } from "@/lib/prisma";
import { centsToCOP } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminEstadisticasPage() {
  const [ordersByStatus, topItems, lowStock] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true, _sum: { totalCents: true } }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      include: { brand: true },
    }),
  ]);

  const statusMap = new Map(ordersByStatus.map((row) => [row.status, row]));
  const allStatuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

  return (
    <div className="space-y-8">
      <h1 className="section-title">Estadísticas</h1>

      <div className="glass-card p-5">
        <h2 className="mb-4 font-display font-bold text-white">Pedidos por estado</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allStatuses.map((status) => {
            const row = statusMap.get(status);
            return (
              <div key={status} className="rounded-lg border border-white/10 p-4">
                <p className="text-sm text-neutral-400">{ORDER_STATUS_LABELS[status]}</p>
                <p className="text-xl font-bold text-white">{row?._count ?? 0}</p>
                <p className="text-xs text-neutral-500">{centsToCOP(row?._sum.totalCents ?? 0)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-3 font-display font-bold text-white">Productos más vendidos</h2>
          {topItems.length === 0 ? (
            <p className="text-sm text-neutral-400">Aún no hay ventas registradas.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {topItems.map((item) => (
                <div key={item.productName} className="flex items-center justify-between py-3">
                  <p className="text-sm text-white">{item.productName}</p>
                  <span className="text-sm font-semibold text-racing-orange">{item._sum.quantity} vendidos</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-3 font-display font-bold text-white">Bajo inventario (≤ {LOW_STOCK_THRESHOLD} un.)</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-neutral-400">Todo el inventario está en buen nivel.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-white">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.brand.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-racing-red">{product.stock} un.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
