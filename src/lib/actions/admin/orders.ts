"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { commitSaleForOrder, releaseInventoryForOrder } from "@/lib/inventory";
import { sendEmail } from "@/lib/email/provider";
import { orderDeliveredEmail, orderShippedEmail, paymentApprovedEmail } from "@/lib/email/templates";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { z } from "zod";

const updateStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(300).optional(),
  trackingCarrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
});

export async function updateOrderStatusAction(input: unknown): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { orderId, status, note, trackingCarrier, trackingNumber } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: "Pedido no encontrado." };

  const previousStatus = order.status as OrderStatus;

  // Inventory side-effects only fire on the transition, never repeatedly.
  if (status === "CANCELLED" && previousStatus !== "CANCELLED" && previousStatus !== "REFUNDED") {
    await releaseInventoryForOrder(orderId, order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
  }
  if (status === "PAID" && previousStatus === "PENDING") {
    await commitSaleForOrder(orderId, order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      paymentStatus: status === "PAID" ? "APPROVED" : status === "CANCELLED" ? "DECLINED" : undefined,
      trackingCarrier: trackingCarrier || undefined,
      trackingNumber: trackingNumber || undefined,
      statusHistory: { create: { status, note } },
    },
  });

  if (status === "PAID") {
    await sendEmail({ to: order.email, subject: `Pago aprobado — pedido #${order.orderNumber}`, html: paymentApprovedEmail(order.orderNumber) });
  } else if (status === "SHIPPED") {
    await sendEmail({
      to: order.email,
      subject: `Tu pedido #${order.orderNumber} va en camino`,
      html: orderShippedEmail(order.orderNumber, trackingNumber, trackingCarrier),
    });
  } else if (status === "DELIVERED") {
    await sendEmail({ to: order.email, subject: `Pedido #${order.orderNumber} entregado`, html: orderDeliveredEmail(order.orderNumber) });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}
