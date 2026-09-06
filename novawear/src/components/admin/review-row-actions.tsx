"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteReviewAction, setReviewApprovalAction } from "@/lib/actions/admin/reviews";
import { Button } from "@/components/ui/button";

export function ReviewRowActions({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      await setReviewApprovalAction(reviewId, !isApproved);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("¿Eliminar esta reseña?")) return;
    startTransition(async () => {
      const res = await deleteReviewAction(reviewId);
      if (res.error) toast.error(res.error);
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" disabled={isPending} onClick={toggle}>
        {isApproved ? "Ocultar" : "Aprobar"}
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={remove} className="text-destructive">
        Eliminar
      </Button>
    </div>
  );
}
