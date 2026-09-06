import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa el nombre de quien recibe").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{7,15}$/, "Ingresa un teléfono válido"),
  line1: z.string().trim().min(4, "Ingresa la dirección").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Selecciona una ciudad"),
  department: z.string().trim().min(2, "Ingresa el departamento"),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
