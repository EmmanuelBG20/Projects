import "server-only";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const whatsappConfigured = Boolean(ACCESS_TOKEN && PHONE_NUMBER_ID);

/**
 * Sends a text message via the WhatsApp Business Cloud API. Without
 * credentials configured, this logs instead of calling the real API — the
 * bot/agent logic still runs end-to-end (see admin/whatsapp for the
 * conversation log), it just doesn't dispatch a real message.
 */
export async function sendWhatsAppMessage(to: string, body: string) {
  if (!whatsappConfigured) {
    console.info(`[whatsapp:dev-mode] to=${to} "${body}"`);
    return { skipped: true as const };
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) {
    throw new Error(`WhatsApp send failed: ${res.status} ${await res.text()}`);
  }

  return { skipped: false as const, result: await res.json() };
}
