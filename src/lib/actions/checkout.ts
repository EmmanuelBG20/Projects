"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCartWithItems, markCartConverted } from "@/lib/actions/cart";
import { CheckoutError, markOrderPaid, placeOrderFromCart } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validations/checkout";
import { getPaymentProvider } from "@/lib/payments/provider";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/provider";
import { orderConfirmationEmail } from "@/lib/email/templates";
import type { PaymentProviderId } from "@/lib/constants";

export interface PlaceOrderState {
  error?: string;
  redirectUrl?: string;
}

export async function placeOrderAction(input: unknown): Promise<PlaceOrderState> {
  const ip = ipFromHeaders(headers());
  const limited = rateLimit(`checkout:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!limited.success) return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };

  const cart = await getCartWithItems();
  if (!cart || cart.items.length === 0) return { error: "Tu carrito está vacío." };

  const user = await getCurrentUser();

  let orderId: string;
  let orderNumber: string;
  let total: number;
  try {
    const result = await placeOrderFromCart(cart, parsed.data, user?.id ?? null);
    orderId = result.orderId;
    orderNumber = result.orderNumber;
    total = result.total;
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.message };
    throw error;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const provider = getPaymentProvider(parsed.data.paymentMethod as PaymentProviderId);

  await prisma.order.update({ where: { id: orderId }, data: { paymentMethod: provider.id } });

  const payment = await provider.createPayment({
    orderId,
    orderNumber,
    amount: total,
    currency: "COP",
    customerEmail: parsed.data.email,
    returnUrl: `${appUrl}/checkout/success`,
  });

  await prisma.payment.create({
    data: {
      orderId,
      provider: provider.id,
      providerRef: payment.providerRef,
      status: payment.status,
      amount: total,
      rawPayload: payment.rawPayload,
    },
  });

  if (payment.status === "APPROVED") {
    await markOrderPaid(orderId);

    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    await sendEmail({
      to: order.email,
      subject: `Confirmamos tu pedido #${order.orderNumber} — NOVAWEAR`,
      html: orderConfirmationEmail(order),
    });

    return { redirectUrl: `/checkout/success?order=${orderNumber}` };
  }

  await markCartConverted(cart.id);

  if (payment.redirectUrl) {
    return { redirectUrl: payment.redirectUrl };
  }

  return { redirectUrl: `/checkout/success?order=${orderNumber}` };
}
