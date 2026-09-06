import { createHash } from "crypto";
import type { PaymentProvider } from "@/lib/payments/types";

const PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
const ENV = process.env.WOMPI_ENV === "production" ? "production" : "sandbox";
const CHECKOUT_BASE = "https://checkout.wompi.co/p/";

/**
 * Wompi Web Checkout widget integration (Colombia — cards, PSE, Nequi where
 * enabled on the merchant account). Requires WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY
 * and WOMPI_EVENTS_SECRET; falls back to the sandbox provider otherwise.
 *
 * Reference: https://docs.wompi.co/ (Web Checkout + signature de integridad).
 * The integrity signature is SHA256(reference + amountInCents + currency + eventsSecret).
 */
export const wompiProvider: PaymentProvider = {
  id: "WOMPI",
  label: "Wompi",
  isConfigured: Boolean(PUBLIC_KEY && process.env.WOMPI_PRIVATE_KEY && EVENTS_SECRET),

  async createPayment(input) {
    const amountInCents = input.amount * 100;
    const integrity = createHash("sha256")
      .update(`${input.orderNumber}${amountInCents}${input.currency}${EVENTS_SECRET}`)
      .digest("hex");

    const params = new URLSearchParams({
      "public-key": PUBLIC_KEY ?? "",
      currency: input.currency,
      "amount-in-cents": String(amountInCents),
      reference: input.orderNumber,
      "signature:integrity": integrity,
      "redirect-url": input.returnUrl,
      "customer-data:email": input.customerEmail,
    });

    return {
      redirectUrl: `${CHECKOUT_BASE}?${params.toString()}`,
      providerRef: input.orderNumber,
      status: "PENDING",
    };
  },

  verifyWebhookSignature(rawBody, headers) {
    if (!EVENTS_SECRET) return false;
    try {
      const body = JSON.parse(rawBody) as {
        signature?: { properties: string[]; checksum: string };
        timestamp?: number;
        data?: Record<string, unknown>;
      };
      const signature = body.signature;
      if (!signature) return false;

      const values = signature.properties
        .map((path) =>
          path
            .split(".")
            .reduce<unknown>(
              (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
              body,
            ),
        )
        .join("");

      const expected = createHash("sha256")
        .update(`${values}${body.timestamp}${EVENTS_SECRET}`)
        .digest("hex");

      return expected === signature.checksum;
    } catch {
      return false;
    }
  },

  async parseWebhookEvent(payload) {
    if (typeof payload !== "object" || payload === null) return null;
    const p = payload as {
      data?: { transaction?: { id?: string; reference?: string; status?: string } };
    };
    const transaction = p.data?.transaction;
    if (!transaction?.id || !transaction.reference || !transaction.status) return null;

    const statusMap: Record<string, "APPROVED" | "DECLINED" | "PENDING"> = {
      APPROVED: "APPROVED",
      DECLINED: "DECLINED",
      VOIDED: "DECLINED",
      ERROR: "DECLINED",
      PENDING: "PENDING",
    };

    return {
      eventId: `${transaction.id}_${transaction.status}`,
      providerRef: transaction.reference,
      status: statusMap[transaction.status] ?? "PENDING",
    };
  },
};

export const wompiEnv = ENV;
