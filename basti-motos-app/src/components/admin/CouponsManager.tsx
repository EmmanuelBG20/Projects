"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createCouponAction, toggleCouponActiveAction, deleteCouponAction } from "@/actions/coupon.actions";
import { pesosToCents, centsToCOP } from "@/lib/money";

type FormValues = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxUses?: number;
  expiresAt?: string;
};

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { type: "PERCENTAGE", minOrder: 0 },
  });
  const type = watch("type");

  async function onSubmit(data: FormValues) {
    setLoading(true);
    const result = await createCouponAction({
      code: data.code,
      type: data.type,
      value: data.type === "PERCENTAGE" ? Number(data.value) : pesosToCents(Number(data.value)),
      minOrderCents: pesosToCents(Number(data.minOrder || 0)),
      maxUses: data.maxUses ? Number(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      isActive: true,
    });
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "Error", "error");
      return;
    }
    push("Cupón creado", "success");
    reset();
    setOpen(false);
    router.refresh();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await toggleCouponActiveAction(id, !isActive);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cupón?")) return;
    const result = await deleteCouponAction(id);
    push(
      result.softDeleted ? "El cupón ya fue usado: se desactivó en vez de eliminarse." : "Cupón eliminado",
      "success"
    );
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title mb-0">Cupones</h1>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 text-neutral-400">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Descuento</th>
              <th className="p-4">Usos</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="p-4 font-mono font-medium text-white">{coupon.code}</td>
                <td className="p-4 text-neutral-300">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : centsToCOP(coupon.value)}
                </td>
                <td className="p-4 text-neutral-300">
                  {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggle(coupon.id, coupon.isActive)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      coupon.isActive ? "bg-neon-green/15 text-neon-green" : "bg-white/10 text-neutral-400"
                    }`}
                  >
                    {coupon.isActive ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:border-racing-red hover:text-racing-red"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-6 text-center text-neutral-400">No hay cupones creados.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo cupón">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Código" placeholder="RIDER20" {...register("code", { required: true })} />
          <Select label="Tipo de descuento" {...register("type")}>
            <option value="PERCENTAGE">Porcentaje</option>
            <option value="FIXED">Monto fijo</option>
          </Select>
          <Input
            label={type === "PERCENTAGE" ? "Valor (%)" : "Valor (COP)"}
            type="number"
            {...register("value", { required: true, valueAsNumber: true })}
          />
          <Input label="Compra mínima (COP)" type="number" {...register("minOrder", { valueAsNumber: true })} />
          <Input label="Usos máximos (opcional)" type="number" {...register("maxUses", { valueAsNumber: true })} />
          <Input label="Fecha de expiración (opcional)" type="date" {...register("expiresAt")} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creando..." : "Crear cupón"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
