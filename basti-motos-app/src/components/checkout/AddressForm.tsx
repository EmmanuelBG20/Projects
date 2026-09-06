"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/address";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLOMBIAN_CITIES } from "@/lib/colombia";

export function AddressForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar dirección",
  loading = false,
}: {
  defaultValues?: Partial<AddressInput>;
  onSubmit: (data: AddressInput) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre de quien recibe" error={errors.fullName?.message} {...register("fullName")} />
      <Input label="Teléfono" error={errors.phone?.message} {...register("phone")} />
      <Input label="Dirección" placeholder="Calle 10 # 20-30, apto 101" error={errors.line1?.message} {...register("line1")} />
      <Input label="Complemento (opcional)" placeholder="Barrio, referencia" error={errors.line2?.message} {...register("line2")} />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Ciudad" error={errors.city?.message} {...register("city")}>
          <option value="">Selecciona</option>
          {COLOMBIAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Input label="Departamento" error={errors.department?.message} {...register("department")} />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-carbon-800" {...register("isDefault")} />
        Usar como dirección predeterminada
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
