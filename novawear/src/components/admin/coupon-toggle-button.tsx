"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleCouponActiveAction } from "@/lib/actions/admin/coupons";
import { Button } from "@/components/ui/button";

export function CouponToggleButton({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleCouponActiveAction(couponId);
          if (res.error) toast.error(res.error);
          router.refresh();
        })
      }
    >
      {isActive ? "Desactivar" : "Activar"}
    </Button>
  );
}
