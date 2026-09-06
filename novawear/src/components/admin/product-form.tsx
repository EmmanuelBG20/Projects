"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { productFormSchema, type ProductInput, type ProductFormValues } from "@/lib/validations/product";
import { createProductAction, updateProductAction } from "@/lib/actions/admin/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_STATUSES, SIZES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export function ProductForm({
  categories,
  defaultValues,
  productId,
}: {
  categories: { id: string; name: string }[];
  defaultValues?: Partial<ProductInput>;
  productId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  // react-hook-form's useFieldArray requires each array item to be an object
  // (it augments items with a stable `id` for React keys) — a plain
  // string[] silently produces zero fields. Images are a flat list of URL
  // strings, so they're managed as local state instead and merged into the
  // payload on submit.
  const [images, setImages] = useState<string[]>(defaultValues?.images?.length ? defaultValues.images : [""]);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      status: "ACTIVE",
      variants: [{ size: "M", color: "Negro", colorHex: "#111111", quantity: 10 }],
      ...defaultValues,
    },
  });

  const variantsArray = useFieldArray({ control, name: "variants" });
  const name = watch("name");

  async function onSubmit(data: ProductFormValues) {
    setServerError(null);
    const cleanedImages = images.map((i) => i.trim()).filter(Boolean);
    if (cleanedImages.length === 0) {
      setImagesError("Agrega al menos una imagen.");
      return;
    }
    setImagesError(null);
    const payload = { ...data, images: cleanedImages };
    const res = productId
      ? await updateProductAction(productId, payload)
      : await createProductAction(payload);
    if (res?.error) {
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    if (productId) {
      toast.success("Producto actualizado");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-10">
      <section className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2 sm:col-span-1">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            {...register("name")}
            onBlur={(e) => {
              if (!productId && !watch("slug")) setValue("slug", slugify(e.target.value));
            }}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="col-span-2 space-y-2 sm:col-span-1">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} />
          {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <Select defaultValue={defaultValues?.categoryId} onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}>
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Precio (COP)</Label>
          <Input id="price" type="number" {...register("price")} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
          <Input id="compareAtPrice" type="number" {...register("compareAtPrice")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select defaultValue={defaultValues?.status ?? "ACTIVE"} onValueChange={(v) => setValue("status", v as ProductInput["status"])}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              defaultChecked={defaultValues?.isFeatured}
              onCheckedChange={(c) => setValue("isFeatured", Boolean(c))}
            />
            Destacado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked={defaultValues?.isNew} onCheckedChange={(c) => setValue("isNew", Boolean(c))} />
            Nuevo
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" rows={3} {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="story">Historia (opcional)</Label>
          <Textarea id="story" rows={2} {...register("story")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input id="material" {...register("material")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careInstructions">Cuidados</Label>
            <Input id="careInstructions" {...register("careInstructions")} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <Label>Imágenes (URLs)</Label>
          <Button type="button" size="sm" variant="outline" onClick={() => setImages((prev) => [...prev, ""])}>
            <Plus className="h-3.5 w-3.5" /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) =>
                  setImages((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                placeholder="https://…"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setImages((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {imagesError && <p className="text-xs text-destructive">{imagesError}</p>}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <Label>Variantes (talla / color / stock)</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => variantsArray.append({ size: "M", color: "Negro", colorHex: "#111111", quantity: 0 })}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar variante
          </Button>
        </div>
        <div className="space-y-2">
          {variantsArray.fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_100px_40px] gap-2">
              <Select
                defaultValue={field.size}
                onValueChange={(v) => setValue(`variants.${i}.size`, v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.concat("Única" as never).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input {...register(`variants.${i}.color` as const)} placeholder="Color" />
              <Input {...register(`variants.${i}.colorHex` as const)} placeholder="#111111" />
              <Input type="number" {...register(`variants.${i}.quantity` as const)} placeholder="Stock" />
              <Button type="button" size="icon" variant="ghost" onClick={() => variantsArray.remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors.variants && <p className="text-xs text-destructive">{errors.variants.message as string}</p>}
      </section>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : productId ? "Guardar cambios" : `Crear ${name || "producto"}`}
      </Button>
    </form>
  );
}
