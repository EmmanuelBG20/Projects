"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleIncomingWhatsAppMessage } from "@/lib/whatsapp/agent";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";

/**
 * Powers the in-browser "chat with the bot" widget on the storefront. This
 * is a demo surface, not a real WhatsApp thread — it exists so the assistant
 * can be tried without a WhatsApp Business number — but it calls the exact
 * same `handleIncomingWhatsAppMessage` the real webhook uses, so it's
 * exercising the real tool-calling / rule-based agent, not a mock of it.
 *
 * Demo sessions are namespaced under "demo:<sessionId>" so they can never
 * collide with a real phone number, and are excluded from anywhere real
 * customer phone numbers are looked up (orders, users) since that prefix
 * never matches a real E.164 number.
 */

const DEMO_PREFIX = "demo:";

const sessionIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/);

export interface DemoChatMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: string;
  createdAt: string;
}

export async function getDemoChatHistory(sessionId: string): Promise<{
  messages: DemoChatMessage[];
  status: "BOT" | "HUMAN" | "CLOSED";
}> {
  const parsed = sessionIdSchema.safeParse(sessionId);
  if (!parsed.success) return { messages: [], status: "BOT" };

  const conversation = await prisma.whatsappConversation.findUnique({
    where: { phoneNumber: `${DEMO_PREFIX}${parsed.data}` },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) return { messages: [], status: "BOT" };

  return {
    status: conversation.status as "BOT" | "HUMAN" | "CLOSED",
    messages: conversation.messages.map((m) => ({
      id: m.id,
      direction: m.direction as "INBOUND" | "OUTBOUND",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function sendDemoChatMessageAction(
  sessionId: string,
  text: string,
): Promise<{ error?: string; reply?: string; status?: "BOT" | "HUMAN" | "CLOSED" }> {
  const parsedSession = sessionIdSchema.safeParse(sessionId);
  if (!parsedSession.success) return { error: "Sesión inválida." };

  const message = text.trim();
  if (!message || message.length > 500) return { error: "Escribe un mensaje de hasta 500 caracteres." };

  const ip = ipFromHeaders(headers());
  const limited = rateLimit(`whatsapp-demo:${ip}`, { limit: 30, windowMs: 5 * 60_000 });
  if (!limited.success) return { error: "Demasiados mensajes. Espera un momento." };

  const phoneNumber = `${DEMO_PREFIX}${parsedSession.data}`;
  const reply = await handleIncomingWhatsAppMessage(phoneNumber, message, "Visitante (demo)");

  const conversation = await prisma.whatsappConversation.findUnique({
    where: { phoneNumber },
    select: { status: true },
  });

  return {
    reply: reply ?? undefined,
    status: (conversation?.status as "BOT" | "HUMAN" | "CLOSED") ?? "BOT",
  };
}
