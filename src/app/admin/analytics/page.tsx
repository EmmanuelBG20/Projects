import type { Metadata } from "next";
import { getCategoryBreakdown, getOrderStatusBreakdown, getPaymentMethodBreakdown } from "@/lib/admin/analytics";
import { CategoryBarChart } from "@/components/admin/category-bar-chart";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS, type OrderStatus, type PaymentProviderId } from "@/lib/constants";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [categories, statuses, methods] = await Promise.all([
    getCategoryBreakdown(),
    getOrderStatusBreakdown(),
    getPaymentMethodBreakdown(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl">Analytics</h1>

      <div className="border border-border p-5">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Ventas por categoría</h2>
        <CategoryBarChart data={categories} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Pedidos por estado</h2>
          <ul className="space-y-2 text-sm">
            {statuses.map((s) => (
              <li key={s.status} className="flex justify-between">
                <span>{ORDER_STATUS_LABELS[s.status as OrderStatus] ?? s.status}</span>
                <span className="tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Métodos de pago aprobados</h2>
          <ul className="space-y-2 text-sm">
            {methods.map((m) => (
              <li key={m.provider} className="flex justify-between">
                <span>{PAYMENT_PROVIDER_LABELS[m.provider as PaymentProviderId] ?? m.provider}</span>
                <span className="tabular-nums">
                  {m.count} · {formatPrice(m.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
