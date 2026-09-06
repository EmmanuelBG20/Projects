import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Mis pedidos" };

const STATUS_VARIANT: Record<OrderStatus, "muted" | "success" | "destructive" | "outline"> = {
  PENDING: "muted",
  PAID: "outline",
  PROCESSING: "outline",
  SHIPPED: "outline",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <EmptyState icon={PackageSearch} title="Aún no tienes pedidos" description="Cuando compres, tus pedidos aparecerán aquí." />
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/account/orders/${order.id}`} className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium">#{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)} · {order.items.length} producto(s)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm tabular-nums">{formatPrice(order.total)}</span>
              <Badge variant={STATUS_VARIANT[order.status as OrderStatus]}>
                {ORDER_STATUS_LABELS[order.status as OrderStatus]}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
