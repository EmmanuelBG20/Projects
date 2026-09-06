import { createHmac } from "crypto";
import type { PaymentProvider } from "@/lib/payments/types";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

/**
 * Mercado Pago Checkout Pro integration (preference-based redirect).
 * Requires MERCADOPAGO_ACCESS_TOKEN; falls back to the sandbox provider
 * otherwise. Reference: https://www.mercadopago.com/developers — Checkout Pro
 * "preferences" API and the `x-signature` webhook verification scheme.
 */
export const mercadoPagoProvider: PaymentProvider = {
  id: "MERCADOPAGO",
  label: "Mercado Pago",
  isConfigured: Boolean(ACCESS_TOKEN),

  async createPayment(input) {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: `Pedido NOVAWEAR ${input.orderNumber}`,
            quantity: 1,
            unit_price: input.amount,
            currency_id: input.currency,
          },
        ],
        external_reference: input.orderNumber,
        payer: { email: input.customerEmail },
        back_urls: {
          success: input.returnUrl,
          pending: input.returnUrl,
          failure: input.returnUrl,
        },
        auto_return: "approved",
      }),
    });

    if (!res.ok) {
      throw new Error(`Mercado Pago: no se pudo crear la preferencia (${res.status})`);
    }

    const data = (await res.json()) as { id: string; init_point: string };
    return { redirectUrl: data.init_point, providerRef: data.id, status: "PENDING" };
  },

  verifyWebhookSignature(rawBody, headers) {
    if (!WEBHOOK_SECRET) return false;
    const signatureHeader = headers.get("x-signature");
    const requestId = headers.get("x-request-id");
    if (!signatureHeader || !requestId) return false;

    const parts = Object.fromEntries(
      signatureHeader.split(",").map((part) => {
        const [key, value] = part.split("=");
        return [key?.trim(), value?.trim()];
      }),
    );
    const ts = parts.ts;
    const v1 = parts.v1;
    if (!ts || !v1) return false;

    let dataId = "";
    try {
      dataId = (JSON.parse(rawBody) as { data?: { id?: string } }).data?.id ?? "";
    } catch {
      return false;
    }

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expected = createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex");
    return expected === v1;
  },

  async parseWebhookEvent(payload) {
    if (typeof payload !== "object" || payload === null) return null;
    const p = payload as { data?: { id?: string }; type?: string; action?: string };
    if (!p.data?.id || p.type !== "payment") return null;

    // The webhook body only carries an id — fetch the actual payment to
    // learn its status and the order reference we stored as external_reference.
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${p.data.id}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    if (!res.ok) return null;
    const payment = (await res.json()) as { status?: string; external_reference?: string };

    const statusMap: Record<string, "APPROVED" | "DECLINED" | "PENDING"> = {
      approved: "APPROVED",
      rejected: "DECLINED",
      cancelled: "DECLINED",
      refunded: "DECLINED",
      pending: "PENDING",
      in_process: "PENDING",
    };

    return {
      eventId: `${p.data.id}_${p.action ?? p.type}`,
      providerRef: payment.external_reference ?? p.data.id,
      status: statusMap[payment.status ?? ""] ?? "PENDING",
    };
  },
};
