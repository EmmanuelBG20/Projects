"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { couponInputSchema, type CouponInput } from "@/lib/validations/coupon";
import { createCouponAction } from "@/lib/actions/admin/coupons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUPON_TYPES } from "@/lib/constants";

export function CreateCouponDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CouponInput>({ resolver: zodResolver(couponInputSchema), defaultValues: { type: "PERCENTAGE" } });

  async function onSubmit(data: CouponInput) {
    const res = await createCouponAction(data);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Cupón creado");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nuevo cupón
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo cupón</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" {...register("code")} placeholder="VERANO20" />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select defaultValue="PERCENTAGE" onValueChange={(v) => setValue("type", v as CouponInput["type"])}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUPON_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "PERCENTAGE" ? "Porcentaje" : "Valor fijo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input id="value" type="number" {...register("value")} placeholder="20" />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minSubtotal">Monto mínimo (opcional)</Label>
              <Input id="minSubtotal" type="number" {...register("minSubtotal")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUses">Usos máximos (opcional)</Label>
              <Input id="maxUses" type="number" {...register("maxUses")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startsAt">Inicio (opcional)</Label>
              <Input id="startsAt" type="date" {...register("startsAt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expira (opcional)</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt")} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando…" : "Crear cupón"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
