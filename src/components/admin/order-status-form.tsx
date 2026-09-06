"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTrackingCarrier,
  currentTrackingNumber,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  currentTrackingCarrier: string | null;
  currentTrackingNumber: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [carrier, setCarrier] = useState(currentTrackingCarrier ?? "");
  const [tracking, setTracking] = useState(currentTrackingNumber ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      const res = await updateOrderStatusAction({
        orderId,
        status,
        trackingCarrier: carrier || undefined,
        trackingNumber: tracking || undefined,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Pedido actualizado");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4 border border-border p-5">
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Transportadora</Label>
          <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Servientrega" />
        </div>
        <div className="space-y-2">
          <Label>Guía</Label>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} disabled={isPending} className="w-full">
        {isPending ? "Guardando…" : "Actualizar pedido"}
      </Button>
    </div>
  );
}
