import { prisma } from "@/lib/prisma";
import { getCartSummary, clearCart } from "@/lib/cart";
import { getShippingCents } from "@/lib/shipping";
import {
  buildWompiCheckoutUrl,
  generatePaymentReference,
  mapWompiStatusToPaymentStatus,
  type WompiWebhookEvent,
} from "@/lib/wompi";
import { sendOrderApprovedEmail } from "@/lib/email";
import type { Prisma } from "@prisma/client";

export class OrderCreationError extends Error {}

/**
 * Recalcula todo en el servidor (nunca confía en el navegador), valida stock
 * y crea una orden en estado PENDING_PAYMENT + su registro de Payment.
 * El stock NO se descuenta aquí: solo se descuenta cuando el webhook de
 * Wompi confirma un pago APPROVED (ver `applyWompiTransactionUpdate`).
 */
export async function createOrderFromCart(params: {
  userId: string;
  userEmail: string;
  addressId: string;
  couponCode?: string;
}) {
  const { userId, userEmail, addressId, couponCode } = params;

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw new OrderCreationError("La dirección seleccionada no es válida.");
  }

  const cart = await getCartSummary(userId);
  if (cart.lines.length === 0) {
    throw new OrderCreationError("Tu carrito está vacío.");
  }

  // Revalidación de stock justo antes de crear el pedido.
  const products = await prisma.product.findMany({
    where: { id: { in: cart.lines.map((l) => l.productId) } },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const line of cart.lines) {
    const product = productById.get(line.productId);
    if (!product || !product.isActive) {
      throw new OrderCreationError(`"${line.name}" ya no está disponible.`);
    }
    if (product.stock < line.quantity) {
      throw new OrderCreationError(
        `Solo quedan ${product.stock} unidades de "${line.name}". Ajusta la cantidad en tu carrito.`
      );
    }
  }

  const subtotalCents = cart.subtotalCents;

  let discountCents = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      throw new OrderCreationError("El cupón no existe o ya no está activo.");
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new OrderCreationError("El cupón ha expirado.");
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new OrderCreationError("El cupón alcanzó su límite de usos.");
    }
    if (subtotalCents < coupon.minOrderCents) {
      throw new OrderCreationError("Tu compra no alcanza el mínimo requerido para este cupón.");
    }
    const alreadyUsed = await prisma.couponUsage.findFirst({ where: { couponId: coupon.id, userId } });
    if (alreadyUsed) {
      throw new OrderCreationError("Ya usaste este cupón anteriormente.");
    }

    discountCents =
      coupon.type === "PERCENTAGE"
        ? Math.round((subtotalCents * coupon.value) / 100)
        : coupon.value;
    discountCents = Math.min(discountCents, subtotalCents);
    couponId = coupon.id;
  }

  const shippingCents = await getShippingCents(address.city, subtotalCents);
  const totalCents = Math.max(subtotalCents - discountCents + shippingCents, 0);
  const reference = generatePaymentReference();

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        reference,
        userId,
        addressId,
        status: "PENDING_PAYMENT",
        subtotalCents,
        discountCents,
        shippingCents,
        totalCents,
        couponId,
        items: {
          create: cart.lines.map((line) => ({
            productId: line.productId,
            productName: line.name,
            sku: productById.get(line.productId)!.sku,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
          })),
        },
        payment: {
          create: {
            provider: "WOMPI",
            reference,
            amountInCents: totalCents,
            currency: "COP",
            status: "PENDING",
          },
        },
      },
    });

    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      await tx.couponUsage.create({
        data: { couponId, userId, orderId: createdOrder.id },
      });
    }

    return createdOrder;
  });

  await clearCart(userId);

  const redirectUrl = process.env.WOMPI_REDIRECT_URL ?? `${process.env.NEXT_PUBLIC_APP_URL}/checkout/resultado`;
  const checkoutUrl = buildWompiCheckoutUrl({
    reference: order.reference,
    amountInCents: order.totalCents,
    currency: "COP",
    customerEmail: userEmail,
    redirectUrl,
  });

  return { order, checkoutUrl };
}

/**
 * Aplica el resultado de una transacción de Wompi (llamado desde el webhook,
 * y opcionalmente desde una verificación manual). Es idempotente: si Wompi
 * reintenta el mismo evento, el `updateMany` con guarda de estado hace que
 * la segunda llamada no tenga efecto (count === 0) y el stock no se toca dos
 * veces.
 */
export async function applyWompiTransactionUpdate(
  transaction: WompiWebhookEvent["data"]["transaction"]
) {
  const mappedStatus = mapWompiStatusToPaymentStatus(transaction.status);

  const result = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.payment.updateMany({
      where: {
        reference: transaction.reference,
        status: { not: "APPROVED" }, // ya aprobado antes -> no reprocesar (idempotencia)
      },
      data: {
        status: mappedStatus,
        transactionId: transaction.id,
        rawPayload: transaction as unknown as Prisma.InputJsonValue,
      },
    });

    if (updateResult.count === 0) {
      return { applied: false as const, orderId: null };
    }

    if (mappedStatus !== "APPROVED") {
      // Pago declinado / anulado / con error: el Payment ya quedó reflejado.
      // El pedido permanece en su estado actual (normalmente PENDING_PAYMENT).
      const payment = await tx.payment.findUnique({ where: { reference: transaction.reference } });
      return { applied: true as const, orderId: payment?.orderId ?? null, approved: false as const };
    }

    const payment = await tx.payment.findUniqueOrThrow({
      where: { reference: transaction.reference },
      include: { order: { include: { items: true } } },
    });

    for (const item of payment.order.items) {
      const decremented = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (decremented.count === 0) {
        console.warn(
          `[orders] Stock insuficiente al aprobar pago para producto ${item.productId} (orden ${payment.orderId}). Se aprueba igualmente; requiere revisión manual de inventario.`
        );
      }
    }

    await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });

    return { applied: true as const, orderId: payment.orderId, approved: true as const };
  });

  if (result.applied && result.orderId && "approved" in result && result.approved) {
    const order = await prisma.order.findUnique({
      where: { id: result.orderId },
      include: { user: true },
    });
    if (order) {
      await sendOrderApprovedEmail(order.user.email, order.id, order.totalCents);
    }
  }

  return result;
}
