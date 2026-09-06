import { createHash, randomBytes } from "crypto";

/**
 * Integración con Wompi Colombia (Web Checkout).
 * Documentación de referencia: https://docs.wompi.co
 *
 * Todo lo que firma o valida secretos vive SOLO en este archivo de servidor.
 * Nunca importes este módulo desde un Client Component.
 */

const WOMPI_BASE_URL =
  process.env.WOMPI_ENV === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";

/** Genera una referencia de pago única, legible y trazable. */
export function generatePaymentReference(): string {
  const random = randomBytes(5).toString("hex");
  return `BASTIMOTOS-${Date.now()}-${random}`.toUpperCase();
}

/**
 * Firma de integridad exigida por Wompi para el Web Checkout.
 * Fórmula oficial: SHA256(referencia + montoEnCentavos + moneda + secretoDeIntegridad)
 */
export function generateIntegritySignature(params: {
  reference: string;
  amountInCents: number;
  currency: string;
}): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    throw new Error(
      "WOMPI_INTEGRITY_SECRET no está configurado. Define esta variable de entorno antes de iniciar un checkout real."
    );
  }

  const raw = `${params.reference}${params.amountInCents}${params.currency}${secret}`;
  return createHash("sha256").update(raw).digest("hex");
}

/** Construye la URL del Web Checkout de Wompi (integración por enlace, sin SDK de JS). */
export function buildWompiCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  redirectUrl: string;
}): string {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_WOMPI_PUBLIC_KEY no está configurado.");
  }

  const signature = generateIntegritySignature(params);

  const search = new URLSearchParams({
    "public-key": publicKey,
    currency: params.currency,
    "amount-in-cents": String(params.amountInCents),
    reference: params.reference,
    "signature:integrity": signature,
    "redirect-url": params.redirectUrl,
    "customer-data:email": params.customerEmail,
  });

  return `https://checkout.wompi.co/p/?${search.toString()}`;
}

function getNestedValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export type WompiWebhookEvent = {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
      status_message?: string | null;
      currency: string;
      customer_email?: string;
      payment_method_type?: string;
    };
  };
  environment: "test" | "prod";
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
  sent_at: string;
};

/**
 * Valida la firma de un evento del webhook de Wompi.
 * Formula: SHA256(valores_concatenados_de_properties + timestamp + eventsSecret)
 */
export function verifyWompiWebhookSignature(event: WompiWebhookEvent): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) {
    console.error("[wompi] WOMPI_EVENTS_SECRET no configurado; se rechaza el webhook por seguridad.");
    return false;
  }

  const concatenatedValues = event.signature.properties
    .map((path) => {
      const value = getNestedValue(event, path);
      return value === undefined || value === null ? "" : String(value);
    })
    .join("");

  const raw = `${concatenatedValues}${event.timestamp}${secret}`;
  const expectedChecksum = createHash("sha256").update(raw).digest("hex");

  return expectedChecksum.toLowerCase() === event.signature.checksum.toLowerCase();
}

/** Mapea el estado de transacción de Wompi a nuestro enum interno PaymentStatus. */
export function mapWompiStatusToPaymentStatus(
  status: WompiWebhookEvent["data"]["transaction"]["status"]
): "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" {
  switch (status) {
    case "APPROVED":
      return "APPROVED";
    case "DECLINED":
      return "DECLINED";
    case "VOIDED":
      return "VOIDED";
    case "ERROR":
      return "ERROR";
    default:
      return "PENDING";
  }
}

/**
 * Consulta el estado real de una transacción directamente en la API de Wompi.
 * Útil como verificación adicional en la página de resultado (nunca como
 * única fuente de verdad: esa siempre es el webhook procesado en servidor).
 */
export async function fetchWompiTransaction(transactionId: string) {
  const res = await fetch(`${WOMPI_BASE_URL}/transactions/${transactionId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`No se pudo consultar la transacción ${transactionId} en Wompi (${res.status})`);
  }

  const json = (await res.json()) as { data: WompiWebhookEvent["data"]["transaction"] };
  return json.data;
}
