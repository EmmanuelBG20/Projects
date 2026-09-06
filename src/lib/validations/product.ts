import { z } from "zod";
import { PRODUCT_STATUSES } from "@/lib/constants";

export const variantInputSchema = z.object({
  id: z.string().optional(),
  size: z.string().trim().min(1, "Requerido"),
  color: z.string().trim().min(1, "Requerido"),
  colorHex: z.string().trim().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(0),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  sku: z.string().trim().min(2).max(60),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  price: z.coerce.number().int().min(0),
  // An empty "precio anterior" input arrives as "" — coerce that straight to
  // undefined instead of letting z.coerce.number() turn it into 0, which
  // would otherwise look like "compare-at price of zero" downstream.
  compareAtPrice: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(0).optional(),
  ),
  description: z.string().trim().min(10).max(2000),
  story: z.string().trim().max(2000).optional().or(z.literal("")),
  material: z.string().trim().max(200).optional().or(z.literal("")),
  careInstructions: z.string().trim().max(400).optional().or(z.literal("")),
  status: z.enum(PRODUCT_STATUSES),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  images: z.array(z.string().trim().url("URL inválida")).min(1, "Agrega al menos una imagen"),
  variants: z.array(variantInputSchema).min(1, "Agrega al menos una variante"),
});

export type ProductInput = z.infer<typeof productInputSchema>;

/**
 * Images are edited as plain local state in ProductForm rather than an RHF
 * field array (react-hook-form's useFieldArray requires object items, not a
 * bare string[] — see the comment in product-form.tsx), so they're merged
 * into the payload on submit instead of being tracked by the form's own
 * resolver. This variant is what `useForm`'s zodResolver actually validates;
 * the full `productInputSchema` (images included) is what the server
 * actions validate once the merged payload reaches them.
 */
export const productFormSchema = productInputSchema.omit({ images: true });
export type ProductFormValues = z.infer<typeof productFormSchema>;
