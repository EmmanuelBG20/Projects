"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addItemToCart,
  setCartItemQuantity,
  removeCartItem,
  getCartSummary,
  mergeGuestCartIntoDb,
} from "@/lib/cart";
import { cartItemInputSchema, guestCartSchema } from "@/lib/validations/checkout";
import type { GuestCartItem } from "@/types";

/**
 * Todas estas acciones requieren sesión: el carrito de un usuario invitado
 * vive solo en localStorage (ver `store/cart-store.ts`) y se sincroniza a la
 * base de datos únicamente al iniciar sesión (`mergeGuestCartAction`).
 */

export async function addToCartAction(productId: string, quantity: number) {
  const session = await auth();
  const parsed = cartItemInputSchema.safeParse({ productId, quantity });
  if (!parsed.success) return { success: false, error: "Cantidad inválida." };

  if (!session?.user) {
    // El cliente maneja el carrito de invitado en su propio store; el server
    // action solo se usa para usuarios autenticados.
    return { success: false, error: "GUEST" };
  }

  try {
    await addItemToCart(session.user.id, parsed.data.productId, parsed.data.quantity);
    revalidatePath("/carrito");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al agregar" };
  }
}

export async function updateCartItemAction(productId: string, quantity: number) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "GUEST" };

  await setCartItemQuantity(session.user.id, productId, quantity);
  revalidatePath("/carrito");
  return { success: true };
}

export async function removeCartItemAction(productId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "GUEST" };

  await removeCartItem(session.user.id, productId);
  revalidatePath("/carrito");
  return { success: true };
}

export async function getCartSummaryAction() {
  const session = await auth();
  if (!session?.user) return { lines: [], subtotalCents: 0, itemCount: 0 };
  return getCartSummary(session.user.id);
}

/** Se llama justo después de iniciar sesión, con el carrito local del navegador. */
export async function mergeGuestCartAction(items: GuestCartItem[]) {
  const session = await auth();
  if (!session?.user) return { success: false };

  const parsed = guestCartSchema.safeParse(items);
  if (!parsed.success) return { success: false };

  await mergeGuestCartIntoDb(session.user.id, parsed.data);
  revalidatePath("/carrito");
  return { success: true };
}
