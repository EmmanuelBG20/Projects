import Stripe from "stripe";
import type { PaymentProvider } from "@/lib/payments/types";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = SECRET_KEY ? new Stripe(SECRET_KEY) : null;

/**
 * Stripe Checkout integration (international payments). Requires
 * STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET; falls back to the sandbox
 * provider otherwise. Stripe expects the smallest currency unit (cents for
 * USD), so COP amounts — which have no subunit — are sent as-is per Stripe's
 * zero-decimal currency list; non-COP integrations should multiply by 100.
 */
export const stripeProvider: PaymentProvider = {
  id: "STRIPE",
  label: "Stripe",
  isConfigured: Boolean(SECRET_KEY && WEBHOOK_SECRET),

  async createPayment(input) {
    if (!stripe) throw new Error("Stripe no está configurado");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      client_reference_id: input.orderNumber,
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amount,
            product_data: { name: `Pedido NOVAWEAR ${input.orderNumber}` },
          },
          quantity: 1,
        },
      ],
      success_url: `${input.returnUrl}?order=${input.orderNumber}`,
      cancel_url: input.returnUrl,
    });

    return { redirectUrl: session.url ?? undefined, providerRef: session.id, status: "PENDING" };
  },

  verifyWebhookSignature(rawBody, headers) {
    if (!stripe || !WEBHOOK_SECRET) return false;
    const signature = headers.get("stripe-signature");
    if (!signature) return false;
    try {
      stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
      return true;
    } catch {
      return false;
    }
  },

  async parseWebhookEvent(payload) {
    const event = payload as Stripe.Event;
    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") return null;

    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.client_reference_id) return null;

    return {
      eventId: event.id,
      providerRef: session.client_reference_id,
      status: event.type === "checkout.session.completed" ? "APPROVED" : "DECLINED",
    };
  },
};
