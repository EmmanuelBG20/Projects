import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Pedido confirmado" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  if (!searchParams.order) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber: searchParams.order },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={1.5} />
      <h1 className="mt-6 font-display text-3xl tracking-tight sm:text-4xl">¡Gracias por tu compra!</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Tu pedido <strong>#{order.orderNumber}</strong> fue registrado con estado{" "}
        <strong>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</strong>. Te enviamos un correo de confirmación a{" "}
        {order.email}.
      </p>

      <div className="mt-8 w-full max-w-sm border border-border p-6 text-left">
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} ({item.variantColor}, {item.variantSize}) x{item.quantity}
              </span>
              <span className="tabular-nums">{formatPrice(item.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-3 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/shop">Seguir comprando</Link>
        </Button>
        <Button asChild>
          <Link href={`/account/orders/${order.id}`}>Ver mi pedido</Link>
        </Button>
      </div>
    </div>
  );
}
