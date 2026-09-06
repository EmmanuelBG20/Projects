import { z } from "zod";
import { PAYMENT_PROVIDERS } from "@/lib/constants";

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Requerido").max(60),
  lastName: z.string().trim().min(1, "Requerido").max(60),
  email: z.string().trim().email("Correo inválido"),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Teléfono inválido"),
  line1: z.string().trim().min(4, "Requerido").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Requerido").max(80),
  department: z.string().trim().min(2, "Requerido").max(80),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_PROVIDERS.filter((p) => p !== "MOCK") as [string, ...string[]]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
