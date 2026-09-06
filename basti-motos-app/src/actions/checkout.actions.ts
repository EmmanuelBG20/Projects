"use server";

import { auth } from "@/lib/auth";
import { createOrderFromCart, OrderCreationError } from "@/lib/orders";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

export async function startCheckoutAction(input: CheckoutInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Debes iniciar sesión para continuar." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." };
  }

  try {
    const { checkoutUrl } = await createOrderFromCart({
      userId: session.user.id,
      userEmail: session.user.email!,
      addressId: parsed.data.addressId,
      couponCode: parsed.data.couponCode || undefined,
    });
    return { success: true, checkoutUrl };
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return { success: false, error: error.message };
    }
    console.error("[checkout] Error inesperado creando la orden:", error);
    return { success: false, error: "No pudimos procesar tu pedido. Intenta de nuevo." };
  }
}
