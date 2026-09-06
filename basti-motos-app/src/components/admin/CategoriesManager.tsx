"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/category-brand.actions";
import type { CategoryInput } from "@/lib/validations/product";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<CategoryInput>();

  function openCreate() {
    setEditing(null);
    reset({ name: "", slug: "", description: "", icon: "" });
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(data: CategoryInput) {
    setLoading(true);
    const result = editing
      ? await updateCategoryAction(editing.id, data)
      : await createCategoryAction(data);
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "Error", "error");
      return;
    }
    push("Categoría guardada", "success");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const result = await deleteCategoryAction(id);
    if (!result.success) {
      push(result.error ?? "Error", "error");
      return;
    }
    push("Categoría eliminada", "success");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title mb-0">Categorías</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      <div className="glass-card divide-y divide-white/10">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-white">{category.name}</p>
              <p className="text-sm text-neutral-500">/{category.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(category)} className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:text-white">
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:border-racing-red hover:text-racing-red"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre" {...register("name", { required: true })} />
          <Input label="Slug" {...register("slug", { required: true })} />
          <Input label="Ícono (nombre lucide, ej: oil-can)" {...register("icon")} />
          <div>
            <label className="label-field">Descripción</label>
            <textarea className="input-field" rows={2} {...register("description")} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
