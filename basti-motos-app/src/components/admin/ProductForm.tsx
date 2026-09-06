"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createProductAction, updateProductAction } from "@/actions/product.actions";
import { pesosToCents } from "@/lib/money";
import type { Category, Brand, Product } from "@prisma/client";

type FormValues = {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | undefined;
  stock: number;
  categoryId: string;
  brandId: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  relatedProductIds: string[];
};

const TAG_OPTIONS = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "OFERTA", label: "Oferta" },
  { value: "TOP_VENTAS", label: "Top ventas" },
];

export function ProductForm({
  categories,
  brands,
  otherProducts,
  initialProduct,
}: {
  categories: Category[];
  brands: Brand[];
  otherProducts: Product[];
  initialProduct?: Product & { relatedTo: { id: string }[] };
}) {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialProduct
      ? {
          name: initialProduct.name,
          slug: initialProduct.slug,
          sku: initialProduct.sku,
          shortDescription: initialProduct.shortDescription,
          description: initialProduct.description,
          price: initialProduct.priceCents / 100,
          compareAtPrice: initialProduct.compareAtPriceCents ? initialProduct.compareAtPriceCents / 100 : undefined,
          stock: initialProduct.stock,
          categoryId: initialProduct.categoryId,
          brandId: initialProduct.brandId,
          tags: initialProduct.tags,
          isFeatured: initialProduct.isFeatured,
          isActive: initialProduct.isActive,
          relatedProductIds: initialProduct.relatedTo.map((p) => p.id),
        }
      : { tags: [], isActive: true, isFeatured: false, relatedProductIds: [] },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);

    const payload = {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      shortDescription: data.shortDescription,
      description: data.description,
      priceCents: pesosToCents(Number(data.price)),
      compareAtPriceCents: data.compareAtPrice ? pesosToCents(Number(data.compareAtPrice)) : null,
      stock: Number(data.stock),
      categoryId: data.categoryId,
      brandId: data.brandId,
      tags: data.tags as ("NUEVO" | "OFERTA" | "TOP_VENTAS")[],
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      relatedProductIds: data.relatedProductIds,
    };

    const result = initialProduct
      ? await updateProductAction(initialProduct.id, payload)
      : await createProductAction(payload);

    setLoading(false);

    if (!result.success) {
      push(result.error ?? "No se pudo guardar el producto", "error");
      return;
    }

    push("Producto guardado", "success");

    if (!initialProduct && "productId" in result) {
      router.push(`/admin/productos/${result.productId}/editar`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="glass-card grid gap-4 p-6 sm:grid-cols-2">
        <Input label="Nombre" error={errors.name?.message} {...register("name", { required: "Requerido" })} />
        <Input label="Slug (URL)" error={errors.slug?.message} {...register("slug", { required: "Requerido" })} />
        <Input label="SKU" error={errors.sku?.message} {...register("sku", { required: "Requerido" })} />
        <Input
          label="Stock"
          type="number"
          error={errors.stock?.message}
          {...register("stock", { required: true, valueAsNumber: true, min: 0 })}
        />
        <Input
          label="Precio (COP)"
          type="number"
          error={errors.price?.message}
          {...register("price", { required: true, valueAsNumber: true, min: 1 })}
        />
        <Input
          label="Precio anterior / oferta (COP, opcional)"
          type="number"
          {...register("compareAtPrice", { valueAsNumber: true })}
        />

        <Select label="Categoría" error={errors.categoryId?.message} {...register("categoryId", { required: "Requerido" })}>
          <option value="">Selecciona</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <Select label="Marca" error={errors.brandId?.message} {...register("brandId", { required: "Requerido" })}>
          <option value="">Selecciona</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
      </div>

      <div className="glass-card space-y-4 p-6">
        <div>
          <label className="label-field">Descripción corta</label>
          <textarea className="input-field" rows={2} {...register("shortDescription", { required: true })} />
        </div>
        <div>
          <label className="label-field">Descripción completa</label>
          <textarea className="input-field" rows={5} {...register("description", { required: true })} />
        </div>
      </div>

      <div className="glass-card p-6">
        <p className="label-field">Etiquetas</p>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <div className="flex flex-wrap gap-4">
              {TAG_OPTIONS.map((tag) => (
                <label key={tag.value} className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={field.value?.includes(tag.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(field.value ?? []), tag.value]
                        : (field.value ?? []).filter((v) => v !== tag.value);
                      field.onChange(next);
                    }}
                    className="h-4 w-4 rounded border-white/20 bg-carbon-800"
                  />
                  {tag.label}
                </label>
              ))}
            </div>
          )}
        />

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-carbon-800" {...register("isFeatured")} />
            Producto destacado
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-carbon-800" {...register("isActive")} />
            Activo (visible en la tienda)
          </label>
        </div>
      </div>

      {otherProducts.length > 0 && (
        <div className="glass-card p-6">
          <p className="label-field">Productos compatibles</p>
          <Controller
            control={control}
            name="relatedProductIds"
            render={({ field }) => (
              <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
                {otherProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(p.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value ?? []), p.id]
                          : (field.value ?? []).filter((v) => v !== p.id);
                        field.onChange(next);
                      }}
                      className="h-4 w-4 rounded border-white/20 bg-carbon-800"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando..." : initialProduct ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
