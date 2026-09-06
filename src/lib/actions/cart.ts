"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { CART_COOKIE } from "@/lib/constants";
import {
  addItemToCart,
  CartError,
  clearCartCoupon,
  findCart,
  getOrCreateCart,
  removeCartItem,
  setCartCoupon,
  summarizeCart,
  updateCartItemQuantity,
  type CartWithDetails,
} from "@/lib/cart";
import {
  addToCartSchema,
  couponCodeSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from "@/lib/validations/cart";

async function currentOwner() {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };
  const token = cookies().get(CART_COOKIE)?.value;
  return { guestToken: token };
}

/** Read-only resolution for Server Components — never mutates cookies. */
export async function getCartForDisplay() {
  const owner = await currentOwner();
  const cart = owner.userId || owner.guestToken ? await findCart(owner) : null;
  return summarizeCart(cart);
}

export async function getCartWithItems(): Promise<CartWithDetails | null> {
  const owner = await currentOwner();
  if (!owner.userId && !owner.guestToken) return null;
  return findCart(owner);
}

async function resolveOrCreateOwner() {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };

  const jar = cookies();
  let token = jar.get(CART_COOKIE)?.value;
  if (!token) {
    token = nanoid();
    jar.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }
  return { guestToken: token };
}

type ActionResult = { error?: string };

export async function addToCartAction(input: unknown): Promise<ActionResult> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos." };

  try {
    const owner = await resolveOrCreateOwner();
    const cart = await getOrCreateCart(owner);
    await addItemToCart(cart.id, parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/cart");
    return {};
  } catch (error) {
    if (error instanceof CartError) return { error: error.message };
    throw error;
  }
}

export async function updateCartItemAction(input: unknown): Promise<ActionResult> {
  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos." };

  try {
    const owner = await currentOwner();
    const cart = owner.userId || owner.guestToken ? await findCart(owner) : null;
    if (!cart) return { error: "Carrito no encontrado." };
    await updateCartItemQuantity(cart.id, parsed.data.itemId, parsed.data.quantity);
    revalidatePath("/cart");
    return {};
  } catch (error) {
    if (error instanceof CartError) return { error: error.message };
    throw error;
  }
}

export async function removeCartItemAction(input: unknown): Promise<ActionResult> {
  const parsed = removeCartItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos." };

  const owner = await currentOwner();
  const cart = owner.userId || owner.guestToken ? await findCart(owner) : null;
  if (!cart) return { error: "Carrito no encontrado." };
  await removeCartItem(cart.id, parsed.data.itemId);
  revalidatePath("/cart");
  return {};
}

export async function applyCouponAction(input: unknown): Promise<ActionResult> {
  const parsed = couponCodeSchema.safeParse(input);
  if (!parsed.success) return { error: "Código inválido." };

  try {
    const owner = await currentOwner();
    const cart = owner.userId || owner.guestToken ? await findCart(owner) : null;
    if (!cart) return { error: "Tu carrito está vacío." };
    await setCartCoupon(cart.id, parsed.data.code);
    revalidatePath("/cart");
    return {};
  } catch (error) {
    if (error instanceof CartError) return { error: error.message };
    throw error;
  }
}

export async function removeCouponAction(): Promise<ActionResult> {
  const owner = await currentOwner();
  const cart = owner.userId || owner.guestToken ? await findCart(owner) : null;
  if (!cart) return {};
  await clearCartCoupon(cart.id);
  revalidatePath("/cart");
  return {};
}

export async function markCartConverted(cartId: string) {
  await prisma.cart.update({ where: { id: cartId }, data: { status: "CONVERTED" } });
}
