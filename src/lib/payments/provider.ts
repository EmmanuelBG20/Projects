import "server-only";
import type { PaymentProviderId } from "@/lib/constants";
import type { PaymentProvider } from "@/lib/payments/types";
import { mockProvider } from "@/lib/payments/mock";
import { wompiProvider } from "@/lib/payments/wompi";
import { mercadoPagoProvider } from "@/lib/payments/mercadopago";
import { stripeProvider } from "@/lib/payments/stripe";

const REGISTRY: Record<Exclude<PaymentProviderId, "MOCK">, PaymentProvider> = {
  WOMPI: wompiProvider,
  MERCADOPAGO: mercadoPagoProvider,
  STRIPE: stripeProvider,
};

/**
 * Resolves the payment provider for a checkout selection. Falls back to the
 * sandbox provider whenever the requested one has no API keys configured, so
 * the storefront stays fully functional without real credentials — the UI
 * surfaces this fallback via `isProviderConfigured` (see checkout-form.tsx).
 */
export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  if (id === "MOCK") return mockProvider;
  const provider = REGISTRY[id];
  return provider.isConfigured ? provider : mockProvider;
}

export function isProviderConfigured(id: Exclude<PaymentProviderId, "MOCK">): boolean {
  return REGISTRY[id].isConfigured;
}

export function getProviderById(id: Exclude<PaymentProviderId, "MOCK">): PaymentProvider {
  return REGISTRY[id];
}
