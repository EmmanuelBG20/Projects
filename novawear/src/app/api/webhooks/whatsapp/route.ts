import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { handleIncomingWhatsAppMessage } from "@/lib/whatsapp/agent";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

/** Meta's webhook verification handshake (done once, when you register the URL). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification failed" }, { status: 403 });
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET) return false;
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(provided, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const ip = ipFromHeaders(request.headers);
  const limited = rateLimit(`webhook:whatsapp:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!limited.success) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const rawBody = await request.text();

  if (APP_SECRET && !verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    entry?: {
      changes?: {
        value?: {
          contacts?: { profile?: { name?: string } }[];
          messages?: { from: string; type: string; text?: { body: string } }[];
        };
      }[];
    }[];
  };

  const messages = payload.entry?.[0]?.changes?.[0]?.value?.messages ?? [];
  const contactName = payload.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name;

  for (const message of messages) {
    if (message.type !== "text" || !message.text?.body) continue;

    const reply = await handleIncomingWhatsAppMessage(message.from, message.text.body, contactName);
    if (reply) {
      await sendWhatsAppMessage(message.from, reply);
    }
  }

  // WhatsApp requires a fast 200 regardless of downstream processing outcome.
  return NextResponse.json({ ok: true });
}
