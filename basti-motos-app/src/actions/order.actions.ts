"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { sendOrderShippingUpdateEmail } from "@/lib/email";
import type { OrderStatus } from "@prisma/client";

const ALLOWED_MANUAL_TRANSITIONS: OrderStatus[] = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

/**
 * El admin solo puede mover manualmente el estado logístico (PROCESSING en
 * adelante). El paso PENDING_PAYMENT -> PAID SIEMPRE lo controla el webhook
 * de Wompi, nunca esta acción, para que un admin no pueda "marcar como
 * pagado" un pedido que Wompi no confirmó.
 */
export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin();

  if (!ALLOWED_MANUAL_TRANSITIONS.includes(status)) {
    return { success: false, error: "Ese estado no se puede asignar manualmente." };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
  if (!order) return { success: false, error: "Pedido no encontrado." };

  if (order.status === "PENDING_PAYMENT") {
    return { success: false, error: "El pedido aún no tiene un pago aprobado por Wompi." };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await sendOrderShippingUpdateEmail(order.user.email, order.id, status);

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/mi-cuenta/pedidos");
  revalidatePath(`/mi-cuenta/pedidos/${orderId}`);
  return { success: true };
}
