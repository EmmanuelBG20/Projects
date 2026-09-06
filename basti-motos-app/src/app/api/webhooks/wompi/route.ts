import { NextRequest, NextResponse } from "next/server";
import { verifyWompiWebhookSignature, type WompiWebhookEvent } from "@/lib/wompi";
import { applyWompiTransactionUpdate } from "@/lib/orders";

/**
 * Webhook público de Wompi. Configúralo en tu panel de Wompi apuntando a
 * https://tu-dominio.com/api/webhooks/wompi
 *
 * Seguridad:
 * - Se valida la firma del evento con WOMPI_EVENTS_SECRET antes de leer nada.
 * - Nunca se confía en el estado que "cree" el navegador: este endpoint es la
 *   única fuente de verdad para aprobar un pago.
 * - Es idempotente: reintentos del mismo evento no descuentan stock dos veces
 *   (ver `applyWompiTransactionUpdate`).
 */
export async function POST(request: NextRequest) {
  let event: WompiWebhookEvent;

  try {
    event = (await request.json()) as WompiWebhookEvent;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!event?.signature?.checksum || !event?.data?.transaction) {
    return NextResponse.json({ error: "Evento con formato inesperado" }, { status: 400 });
  }

  const validSignature = verifyWompiWebhookSignature(event);
  if (!validSignature) {
    console.error("[webhook:wompi] Firma inválida, evento rechazado", {
      reference: event.data.transaction.reference,
    });
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  try {
    const result = await applyWompiTransactionUpdate(event.data.transaction);
    console.info("[webhook:wompi] Evento procesado", {
      reference: event.data.transaction.reference,
      status: event.data.transaction.status,
      applied: result.applied,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook:wompi] Error procesando el evento:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
