"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Brand } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createBrandAction, updateBrandAction, deleteBrandAction } from "@/actions/category-brand.actions";
import type { BrandInput } from "@/lib/validations/product";

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<BrandInput>();

  function openCreate() {
    setEditing(null);
    reset({ name: "", slug: "", logoUrl: "" });
    setOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    reset({ name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl ?? "" });
    setOpen(true);
  }

  async function onSubmit(data: BrandInput) {
    setLoading(true);
    const result = editing ? await updateBrandAction(editing.id, data) : await createBrandAction(data);
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "Error", "error");
      return;
    }
    push("Marca guardada", "success");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta marca?")) return;
    const result = await deleteBrandAction(id);
    if (!result.success) {
      push(result.error ?? "Error", "error");
      return;
    }
    push("Marca eliminada", "success");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title mb-0">Marcas</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nueva marca
        </button>
      </div>

      <div className="glass-card divide-y divide-white/10">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-white">{brand.name}</p>
              <p className="text-sm text-neutral-500">/{brand.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(brand)} className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:text-white">
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(brand.id)}
                className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:border-racing-red hover:text-racing-red"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar marca" : "Nueva marca"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre" {...register("name", { required: true })} />
          <Input label="Slug" {...register("slug", { required: true })} />
          <Input label="URL del logo (opcional)" {...register("logoUrl")} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
