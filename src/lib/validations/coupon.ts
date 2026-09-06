import { z } from "zod";
import { COUPON_TYPES } from "@/lib/constants";

export const couponInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .transform((v) => v.toUpperCase()),
  type: z.enum(COUPON_TYPES),
  value: z.coerce.number().int().min(1),
  // Empty optional-number inputs arrive as "" — preprocess that to undefined
  // instead of letting z.coerce.number() turn it into 0 (which would fail
  // maxUses' .min(1) and silently mean "no minimum" for minSubtotal instead
  // of "not set").
  minSubtotal: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(0).optional(),
  ),
  maxUses: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(1).optional(),
  ),
  startsAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type CouponInput = z.infer<typeof couponInputSchema>;
