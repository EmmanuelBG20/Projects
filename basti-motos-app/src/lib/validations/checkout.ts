import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Selecciona una dirección de envío"),
  couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;

/** Forma del carrito tal como se guarda en localStorage para invitados. */
export const guestCartSchema = z.array(cartItemInputSchema);

export type GuestCart = z.infer<typeof guestCartSchema>;
