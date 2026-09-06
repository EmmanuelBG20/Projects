import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Pedidos" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<OrderStatus, "muted" | "success" | "destructive" | "outline"> = {
  PENDING: "muted",
  PAID: "outline",
  PROCESSING: "outline",
  SHIPPED: "outline",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const orders = await prisma.order.findMany({
    where: searchParams.status ? { status: searchParams.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statuses: (OrderStatus | undefined)[] = [undefined, "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={`border px-3 py-1.5 text-xs uppercase tracking-widest ${
              searchParams.status === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
            }`}
          >
            {s ? ORDER_STATUS_LABELS[s] : "Todos"}
          </Link>
        ))}
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium hover:underline">
                    #{order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {order.shippingFirstName} {order.shippingLastName}
                  <p className="text-xs text-muted-foreground">{order.email}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-sm tabular-nums">{formatPrice(order.total)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.paymentStatus}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[order.status as OrderStatus]}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
