"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adjustVariantStockAction, restockVariantAction } from "@/lib/actions/admin/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InventoryRowActions({ variantId }: { variantId: string }) {
  const [open, setOpen] = useState(false);
  const [restockQty, setRestockQty] = useState("");
  const [adjustQty, setAdjustQty] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function restock() {
    if (!restockQty) return;
    startTransition(async () => {
      const res = await restockVariantAction({ variantId, quantity: Number(restockQty) });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Stock actualizado");
        setRestockQty("");
        setOpen(false);
        router.refresh();
      }
    });
  }

  function adjust() {
    if (!adjustQty) return;
    startTransition(async () => {
      const res = await adjustVariantStockAction({ variantId, newQuantity: Number(adjustQty) });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Inventario ajustado");
        setAdjustQty("");
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Ajustar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-20"
        type="number"
        placeholder="+Entrada"
        value={restockQty}
        onChange={(e) => setRestockQty(e.target.value)}
      />
      <Button size="sm" disabled={isPending} onClick={restock}>
        Entrada
      </Button>
      <Input
        className="h-8 w-20"
        type="number"
        placeholder="Total"
        value={adjustQty}
        onChange={(e) => setAdjustQty(e.target.value)}
      />
      <Button size="sm" variant="outline" disabled={isPending} onClick={adjust}>
        Fijar
      </Button>
    </div>
  );
}
