import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  comment: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(1000),
});
