import { z } from "zod";

export const shopSearchParamsSchema = z.object({
  q: z.string().trim().max(100).optional(),
  size: z.union([z.string(), z.array(z.string())]).optional(),
  color: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc", "newest"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export function toArray(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
