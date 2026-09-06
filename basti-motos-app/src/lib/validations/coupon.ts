import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(30),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().positive(),
  maxUses: z.number().int().positive().optional().nullable(),
  minOrderCents: z.number().int().min(0).default(0),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
