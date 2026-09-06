import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ventas totales" value={formatPrice(stats.totalSales)} icon={DollarSign} />
        <StatCard label="Ventas de hoy" value={formatPrice(stats.todaySales)} icon={TrendingUp} />
        <StatCard label="Ventas del mes" value={formatPrice(stats.monthSales)} icon={TrendingUp} />
        <StatCard label="Ticket promedio" value={formatPrice(stats.avgTicket)} icon={ShoppingBag} hint={`${stats.orderCount} pedidos`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-border p-5 lg:col-span-2">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Ventas — últimos 14 días
          </h2>
          <SalesChart data={stats.salesByDay} />
        </div>
        <div className="border border-border p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> Stock bajo
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todo el inventario está saludable.</p>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {stats.lowStock.map((row, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {row.productName}
                    <span className="text-muted-foreground"> · {row.variantLabel}</span>
                  </span>
                  <span className={row.available === 0 ? "text-destructive" : "text-rust"}>{row.available}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inventory" className="mt-4 block text-xs underline text-muted-foreground">
            Ver inventario completo
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Productos más vendidos</h2>
          <ul className="space-y-3 text-sm">
            {stats.topProducts.map((p) => (
              <li key={p.productId} className="flex justify-between">
                <span>{p.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {p.quantity} uds · {formatPrice(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Clientes</h2>
          <StatCard label="Clientes registrados" value={String(stats.customerCount)} icon={Users} />
        </div>
      </div>
    </div>
  );
}
