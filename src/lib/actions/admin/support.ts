"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { WHATSAPP_CONVERSATION_STATUSES, SUPPORT_TICKET_STATUSES } from "@/lib/constants";

const conversationStatusSchema = z.object({
  conversationId: z.string().min(1),
  status: z.enum(WHATSAPP_CONVERSATION_STATUSES as unknown as [string, ...string[]]),
});

/** Lets a human agent take a WhatsApp conversation over from the bot, or hand it back. */
export async function setConversationStatusAction(input: unknown): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = conversationStatusSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos." };

  await prisma.whatsappConversation.update({
    where: { id: parsed.data.conversationId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/whatsapp");
  return {};
}

const ticketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(SUPPORT_TICKET_STATUSES as unknown as [string, ...string[]]),
});

export async function setTicketStatusAction(input: unknown): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = ticketStatusSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos." };

  await prisma.supportTicket.update({
    where: { id: parsed.data.ticketId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/support");
  revalidatePath("/admin/whatsapp");
  return {};
}
