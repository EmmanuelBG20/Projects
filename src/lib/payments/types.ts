import type { PaymentProviderId, PaymentStatus } from "@/lib/constants";

export interface CreatePaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number; // in COP (or provider currency), whole units
  currency: string;
  customerEmail: string;
  returnUrl: string;
}

export interface CreatePaymentResult {
  /** Present when the customer must be redirected to the provider's hosted checkout. */
  redirectUrl?: string;
  providerRef: string;
  status: Extract<PaymentStatus, "PENDING" | "APPROVED">;
  rawPayload?: string;
}

export interface WebhookEventResult {
  eventId: string;
  providerRef: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  id: PaymentProviderId;
  label: string;
  /** True only when this provider's required environment variables are set. */
  isConfigured: boolean;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Verifies the authenticity of an incoming webhook request. */
  verifyWebhookSignature(rawBody: string, headers: Headers): boolean;
  /**
   * Extracts a normalized event from an already-verified webhook payload.
   * Async because some providers (Mercado Pago) only send an id in the
   * webhook body and require a follow-up API call to resolve the real status.
   */
  parseWebhookEvent(payload: unknown): Promise<WebhookEventResult | null>;
}
