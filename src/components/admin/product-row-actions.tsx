"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProductAction, toggleProductStatusAction } from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/lib/constants";

export function ProductRowActions({ productId, status }: { productId: string; status: ProductStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const res = await toggleProductStatusAction(productId);
      if (res.error) toast.error(res.error);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      const res = await deleteProductAction(productId);
      if (res.error) toast.message(res.error);
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/products/${productId}`}>Editar</Link>
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={toggle}>
        {status === "ACTIVE" ? "Desactivar" : "Activar"}
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={remove} className="text-destructive">
        Eliminar
      </Button>
    </div>
  );
}
