import { nanoid } from "nanoid";
import type { PaymentProvider } from "@/lib/payments/types";

/**
 * Sandbox/mock provider — always "configured", always approves instantly.
 * Used automatically whenever the customer's selected provider (Wompi,
 * Mercado Pago, Stripe) has no API keys configured, so the app stays fully
 * functional without real credentials. Clearly surfaced as "Modo sandbox" in
 * the checkout UI — see components/checkout/checkout-form.tsx.
 */
export const mockProvider: PaymentProvider = {
  id: "MOCK",
  label: "Sandbox (demo)",
  isConfigured: true,

  async createPayment(input) {
    return {
      providerRef: `mock_${nanoid(10)}`,
      status: "APPROVED",
      rawPayload: JSON.stringify({ mode: "sandbox", orderId: input.orderId, amount: input.amount }),
    };
  },

  verifyWebhookSignature() {
    return true;
  },

  async parseWebhookEvent(payload) {
    if (typeof payload !== "object" || payload === null) return null;
    const p = payload as Record<string, unknown>;
    if (typeof p.providerRef !== "string" || typeof p.status !== "string") return null;
    return { eventId: `mock_${p.providerRef}`, providerRef: p.providerRef, status: p.status as never };
  },
};
