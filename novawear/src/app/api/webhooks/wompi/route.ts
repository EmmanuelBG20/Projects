import { NextResponse, type NextRequest } from "next/server";
import { getProviderById } from "@/lib/payments/provider";
import { handlePaymentWebhook } from "@/lib/webhooks/handle-payment-event";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`webhook:wompi:${ipFromHeaders(request.headers)}`, { limit: 60, windowMs: 60_000 });
  if (!limited.success) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const rawBody = await request.text();
  const { status, body } = await handlePaymentWebhook(getProviderById("WOMPI"), rawBody, request.headers);
  return NextResponse.json(body, { status });
}
