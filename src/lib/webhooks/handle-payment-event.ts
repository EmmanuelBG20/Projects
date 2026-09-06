import "server-only";
import { prisma } from "@/lib/prisma";
import { markOrderDeclined, markOrderPaid } from "@/lib/orders";
import { sendEmail } from "@/lib/email/provider";
import { orderConfirmationEmail } from "@/lib/email/templates";
import type { PaymentProvider } from "@/lib/payments/types";

/**
 * Shared webhook processing for every payment provider: verifies the
 * signature, de-duplicates via the WebhookEvent ledger (unique on
 * provider+eventId), then transitions the order exactly once. Each provider
 * route (see app/api/webhooks/<provider>/route.ts) is a thin adapter around
 * this — all business logic lives here so the three providers stay in sync.
 */
export async function handlePaymentWebhook(
  provider: PaymentProvider,
  rawBody: string,
  headers: Headers,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!provider.verifyWebhookSignature(rawBody, headers)) {
    return { status: 401, body: { error: "invalid signature" } };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: "invalid json" } };
  }

  const event = await provider.parseWebhookEvent(payload);
  if (!event) {
    // Not an event type we care about (e.g. a ping) — acknowledge and ignore.
    return { status: 200, body: { ignored: true } };
  }

  try {
    await prisma.webhookEvent.create({
      data: { provider: provider.id, eventId: event.eventId, payload: rawBody },
    });
  } catch {
    // Unique constraint hit — we've already processed this exact event.
    return { status: 200, body: { duplicate: true } };
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: event.providerRef } });
  if (!order) {
    return { status: 200, body: { warning: "order not found", providerRef: event.providerRef } };
  }

  await prisma.payment.updateMany({
    where: { orderId: order.id, provider: provider.id },
    data: { status: event.status, providerRef: event.providerRef },
  });

  if (order.status === "PENDING") {
    if (event.status === "APPROVED") {
      await markOrderPaid(order.id);
      const full = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
      await sendEmail({
        to: full.email,
        subject: `Confirmamos tu pedido #${full.orderNumber} — NOVAWEAR`,
        html: orderConfirmationEmail(full),
      });
    } else if (event.status === "DECLINED") {
      await markOrderDeclined(order.id);
    }
  }

  return { status: 200, body: { ok: true } };
}
