import "server-only";
import { prisma } from "@/lib/prisma";
import { availableQuantity } from "@/lib/inventory";
import { evaluateCoupon } from "@/lib/coupons";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const CART_INCLUDE = {
  coupon: true,
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      variant: { include: { inventory: true } },
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithDetails = Prisma.CartGetPayload<{ include: typeof CART_INCLUDE }>;

export interface CartOwner {
  userId?: string;
  guestToken?: string;
}

export async function findCart(owner: CartOwner): Promise<CartWithDetails | null> {
  if (owner.userId) {
    return prisma.cart.findUnique({ where: { userId: owner.userId }, include: CART_INCLUDE });
  }
  if (owner.guestToken) {
    return prisma.cart.findUnique({ where: { guestToken: owner.guestToken }, include: CART_INCLUDE });
  }
  return null;
}

export async function getOrCreateCart(owner: CartOwner): Promise<CartWithDetails> {
  const existing = await findCart(owner);
  if (existing) return existing;

  const created = await prisma.cart.create({
    data: owner.userId ? { userId: owner.userId } : { guestToken: owner.guestToken },
  });
  return prisma.cart.findUniqueOrThrow({ where: { id: created.id }, include: CART_INCLUDE });
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  couponCode: string | null;
  couponError?: string;
}

export function lineTotal(item: CartWithDetails["items"][number]) {
  const unitPrice = item.variant.priceOverride ?? item.product.price;
  return unitPrice * item.quantity;
}

export async function summarizeCart(cart: CartWithDetails | null): Promise<CartSummary> {
  if (!cart || cart.items.length === 0) {
    return { itemCount: 0, subtotal: 0, discountTotal: 0, shippingTotal: 0, total: 0, couponCode: null };
  }

  const subtotal = cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  let discountTotal = 0;
  let couponError: string | undefined;
  if (cart.coupon) {
    const lines = await Promise.all(
      cart.items.map(async (item) => ({
        productId: item.productId,
        categoryId: (
          await prisma.product.findUnique({ where: { id: item.productId }, select: { categoryId: true } })
        )?.categoryId ?? "",
        lineTotal: lineTotal(item),
      })),
    );
    const evaluation = await evaluateCoupon(cart.coupon.code, lines, subtotal);
    if (evaluation.valid) {
      discountTotal = evaluation.discountAmount;
    } else {
      couponError = evaluation.error;
    }
  }

  const afterDiscount = subtotal - discountTotal;
  const shippingTotal = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const total = Math.max(0, afterDiscount) + shippingTotal;

  return {
    itemCount,
    subtotal,
    discountTotal,
    shippingTotal,
    total,
    couponCode: cart.coupon?.code ?? null,
    couponError,
  };
}

export class CartError extends Error {}

export async function addItemToCart(cartId: string, variantId: string, quantity: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventory: true, product: true },
  });
  if (!variant || variant.product.status !== "ACTIVE") {
    throw new CartError("Este producto ya no está disponible.");
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });
  const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;

  const available = variant.inventory ? availableQuantity(variant.inventory) : 0;
  if (desiredQuantity > available) {
    throw new CartError(
      available > 0
        ? `Solo quedan ${available} unidades disponibles de esta variante.`
        : "Esta variante está agotada.",
    );
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: desiredQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId, productId: variant.productId, variantId, quantity },
    });
  }
}

export async function updateCartItemQuantity(cartId: string, itemId: string, quantity: number) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId },
    include: { variant: { include: { inventory: true } } },
  });
  if (!item) throw new CartError("El producto ya no está en tu carrito.");

  const available = item.variant.inventory ? availableQuantity(item.variant.inventory) : 0;
  if (quantity > available) {
    throw new CartError(`Solo quedan ${available} unidades disponibles.`);
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeCartItem(cartId: string, itemId: string) {
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
}

export async function setCartCoupon(cartId: string, code: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) throw new CartError("Cupón no válido.");
  await prisma.cart.update({ where: { id: cartId }, data: { couponId: coupon.id } });
}

export async function clearCartCoupon(cartId: string) {
  await prisma.cart.update({ where: { id: cartId }, data: { couponId: null } });
}

/** Merges a guest cart into the signed-in user's cart right after login. */
export async function mergeGuestCartIntoUser(guestToken: string, userId: string) {
  const guestCart = await prisma.cart.findUnique({ where: { guestToken }, include: CART_INCLUDE });
  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart({ userId });

  for (const item of guestCart.items) {
    try {
      await addItemToCart(userCart.id, item.variantId, item.quantity);
    } catch {
      // Skip lines that no longer fit in stock rather than failing the merge.
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
}
