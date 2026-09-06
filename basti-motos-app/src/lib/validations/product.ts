import { z } from "zod";

export const productTagEnum = z.enum(["NUEVO", "OFERTA", "TOP_VENTAS"]);

export const productSchema = z.object({
  name: z.string().trim().min(3, "Ingresa el nombre del producto").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
  sku: z.string().trim().min(3).max(40),
  shortDescription: z.string().trim().min(10).max(200),
  description: z.string().trim().min(20),
  priceCents: z.number().int().positive("El precio debe ser mayor a 0"),
  compareAtPriceCents: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  brandId: z.string().min(1, "Selecciona una marca"),
  tags: z.array(productTagEnum).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  relatedProductIds: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  icon: z.string().trim().max(60).optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
});

export type BrandInput = z.infer<typeof brandSchema>;
