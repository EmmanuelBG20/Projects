import Link from "next/link";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { centsToCOP } from "@/lib/money";
import { StatCard } from "@/components/admin/StatCard";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminOverviewPage() {
  const [salesAgg, orderCount, productCount, lowStockProducts, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } }, _sum: { totalCents: true } }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } }, orderBy: { stock: "asc" }, take: 5 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Ventas totales" value={centsToCOP(salesAgg._sum.totalCents ?? 0)} accent />
        <StatCard icon={ShoppingCart} label="Pedidos totales" value={String(orderCount)} />
        <StatCard icon={Package} label="Productos activos" value={String(productCount)} />
        <StatCard icon={AlertTriangle} label="Bajo inventario" value={String(lowStockProducts.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-3 font-display font-bold text-white">Pedidos recientes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-neutral-400">Sin pedidos todavía.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center justify-between py-3 hover:opacity-80"
                >
                  <div>
                    <p className="text-sm font-medium text-white">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-neutral-500">{order.user.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-3 font-display font-bold text-white">Bajo inventario</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-neutral-400">Todo el inventario está en buen nivel.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/admin/inventario"
                  className="flex items-center justify-between py-3 hover:opacity-80"
                >
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <span className="text-sm font-semibold text-racing-red">{product.stock} un.</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
