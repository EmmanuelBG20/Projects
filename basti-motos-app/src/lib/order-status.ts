import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago pendiente",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-white/10 text-neutral-300",
  PAID: "bg-neon-green/15 text-neon-green",
  PROCESSING: "bg-racing-orange/15 text-racing-orange",
  SHIPPED: "bg-blue-500/15 text-blue-400",
  DELIVERED: "bg-neon-green/15 text-neon-green",
  CANCELLED: "bg-racing-red/15 text-racing-red",
  REFUNDED: "bg-racing-red/15 text-racing-red",
};
