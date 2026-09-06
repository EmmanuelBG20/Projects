"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/order.actions";
import { useToast } from "@/components/ui/Toast";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

const MANUAL_STATUSES: OrderStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(
    MANUAL_STATUSES.includes(currentStatus) ? currentStatus : "PROCESSING"
  );
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const canUpdate = currentStatus !== "PENDING_PAYMENT";

  async function handleUpdate() {
    setLoading(true);
    const result = await updateOrderStatusAction(orderId, status);
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "No se pudo actualizar", "error");
      return;
    }
    push("Estado del pedido actualizado", "success");
    router.refresh();
  }

  if (!canUpdate) {
    return (
      <p className="text-sm text-neutral-400">
        Este pedido aún no tiene un pago aprobado por Wompi, por eso no se puede cambiar el estado logístico todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="input-field w-auto">
        {MANUAL_STATUSES.map((s) => (
          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
        ))}
      </select>
      <button onClick={handleUpdate} disabled={loading} className="btn-primary">
        {loading ? "Actualizando..." : "Actualizar estado"}
      </button>
    </div>
  );
}
