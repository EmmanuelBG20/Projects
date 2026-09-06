import "server-only";
import { prisma } from "@/lib/prisma";
import {
  availableQuantity,
  commitSaleForOrder,
  InsufficientStockError,
  releaseInventoryForOrder,
  reserveInventoryForOrder,
} from "@/lib/inventory";
import { evaluateCoupon, recordCouponUsage } from "@/lib/coupons";
import { generateOrderNumber } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "@/lib/constants";
import type { CartWithDetails } from "@/lib/cart";
import type { CheckoutInput } from "@/lib/validations/checkout";

export class CheckoutError extends Error {}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
}

/**
 * Creates an order from the customer's cart: re-validates stock against the
 * database (never the client), snapshots pricing/coupon/address, reserves
 * inventory transactionally, and marks the cart converted. Payment approval
 * happens afterwards (see lib/actions/checkout.ts) and either commits the
 * reservation into a sale or releases it.
 */
export async function placeOrderFromCart(
  cart: CartWithDetails,
  input: CheckoutInput,
  userId: string | null,
): Promise<PlaceOrderResult> {
  if (cart.items.length === 0) throw new CheckoutError("Tu carrito está vacío.");

  // Re-validate stock against the database — never trust client-side totals.
  for (const item of cart.items) {
    if (!item.variant.inventory || availableQuantity(item.variant.inventory) < item.quantity) {
      throw new CheckoutError(`"${item.product.name}" ya no tiene stock suficiente. Ajusta tu carrito.`);
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.variant.priceOverride ?? item.product.price) * item.quantity,
    0,
  );

  let discountTotal = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;

  if (cart.coupon) {
    const lines = await Promise.all(
      cart.items.map(async (item) => ({
        productId: item.productId,
        categoryId: (
          await prisma.product.findUnique({ where: { id: item.productId }, select: { categoryId: true } })
        )?.categoryId ?? "",
        lineTotal: (item.variant.priceOverride ?? item.product.price) * item.quantity,
      })),
    );
    const evaluation = await evaluateCoupon(cart.coupon.code, lines, subtotal);
    if (evaluation.valid) {
      discountTotal = evaluation.discountAmount;
      couponId = cart.coupon.id;
      couponCode = cart.coupon.code;
    }
  }

  const afterDiscount = Math.max(0, subtotal - discountTotal);
  const shippingTotal = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const total = afterDiscount + shippingTotal;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: userId ?? undefined,
      email: input.email,
      phone: input.phone,
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotal,
      discountTotal,
      shippingTotal,
      total,
      couponId: couponId ?? undefined,
      couponCode: couponCode ?? undefined,
      shippingFirstName: input.firstName,
      shippingLastName: input.lastName,
      shippingPhone: input.phone,
      shippingLine1: input.line1,
      shippingLine2: input.line2 || null,
      shippingCity: input.city,
      shippingDepartment: input.department,
      shippingPostalCode: input.postalCode || null,
      notes: input.notes || null,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantSize: item.variant.size,
          variantColor: item.variant.color,
          sku: item.variant.sku,
          unitPrice: item.variant.priceOverride ?? item.product.price,
          quantity: item.quantity,
          total: (item.variant.priceOverride ?? item.product.price) * item.quantity,
        })),
      },
      statusHistory: { create: [{ status: "PENDING", note: "Pedido creado" }] },
    },
  });

  try {
    await reserveInventoryForOrder(
      order.id,
      cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    );
  } catch (error) {
    // Roll back the order we just created if reservation fails (race with
    // another concurrent checkout that took the last units).
    await prisma.order.delete({ where: { id: order.id } });
    if (error instanceof InsufficientStockError) {
      throw new CheckoutError("Uno de los productos se agotó mientras completabas tu pedido.");
    }
    throw error;
  }

  if (couponId) {
    await recordCouponUsage(couponId, order.id, discountTotal, userId);
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED" } });

  return { orderId: order.id, orderNumber: order.orderNumber, total: order.total };
}

/** Approves a pending order: converts the inventory reservation into a sale. */
export async function markOrderPaid(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });

  await commitSaleForOrder(
    orderId,
    order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
  );

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentStatus: "APPROVED",
      statusHistory: { create: { status: "PAID", note: "Pago aprobado" } },
    },
  });
}

/** Declines a pending order: releases the inventory reservation. */
export async function markOrderDeclined(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });

  await releaseInventoryForOrder(
    orderId,
    order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
  );

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      paymentStatus: "DECLINED",
      statusHistory: { create: { status: "CANCELLED", note: "Pago rechazado" } },
    },
  });
}
