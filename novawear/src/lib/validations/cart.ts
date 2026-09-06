import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const removeCartItemSchema = z.object({
  itemId: z.string().min(1),
});

export const couponCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .transform((v) => v.toUpperCase()),
});
