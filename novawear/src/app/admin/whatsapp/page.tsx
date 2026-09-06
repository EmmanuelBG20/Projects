import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import { getIntegrationStatuses } from "@/lib/admin/integrations";
import { ConversationStatusToggle } from "@/components/admin/conversation-status-toggle";
import type { WhatsappConversationStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "WhatsApp" };
export const dynamic = "force-dynamic";

export default async function AdminWhatsappPage({
  searchParams,
}: {
  searchParams: { conversation?: string; phone?: string };
}) {
  const [conversations, whatsappStatus] = await Promise.all([
    prisma.whatsappConversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    Promise.resolve(getIntegrationStatuses().find((i) => i.id === "whatsapp")),
  ]);

  // Support tickets link here by phone number (a ticket doesn't know the
  // conversation's id), everything else links by id.
  const selectedId = searchParams.conversation
    ?? (searchParams.phone ? conversations.find((c) => c.phoneNumber === searchParams.phone)?.id : undefined)
    ?? conversations[0]?.id;
  const selected = selectedId
    ? await prisma.whatsappConversation.findUnique({
        where: { id: selectedId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  const openTickets = selected
    ? await prisma.supportTicket.findMany({
        where: { phone: selected.phoneNumber, status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">WhatsApp</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/support" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Ver tickets de soporte →
          </Link>
          <Badge variant={whatsappStatus?.connected ? "success" : "muted"}>
            {whatsappStatus?.connected ? "Conectado" : "Desconectado (modo demo)"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 border border-border lg:grid-cols-[280px_1fr]">
        <div className="divide-y divide-border border-r border-border">
          {conversations.length === 0 && <p className="p-4 text-sm text-muted-foreground">Sin conversaciones aún.</p>}
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/admin/whatsapp?conversation=${c.id}`}
              className={cn("block p-4", selectedId === c.id && "bg-secondary")}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.customerName ?? c.phoneNumber}</p>
                <Badge variant={c.status === "HUMAN" ? "rust" : c.status === "CLOSED" ? "muted" : "outline"}>
                  {c.status}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{c.messages[0]?.content}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(c.lastMessageAt)}</p>
            </Link>
          ))}
        </div>

        <div className="p-5">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Selecciona una conversación.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{selected.customerName ?? selected.phoneNumber}</p>
                  <p className="text-xs text-muted-foreground">{selected.phoneNumber}</p>
                </div>
                <ConversationStatusToggle
                  conversationId={selected.id}
                  status={selected.status as WhatsappConversationStatus}
                />
              </div>

              {openTickets.length > 0 && (
                <div className="flex items-start gap-2 border border-rust/40 bg-rust/5 p-3 text-xs">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rust" />
                  <div>
                    <p className="font-medium text-rust">
                      {openTickets.length} ticket{openTickets.length > 1 ? "s" : ""} abierto
                      {openTickets.length > 1 ? "s" : ""} para este cliente
                    </p>
                    {openTickets.map((t) => (
                      <p key={t.id} className="mt-1 text-muted-foreground">
                        {t.subject} — {t.message.slice(0, 80)}
                        {t.message.length > 80 ? "…" : ""}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selected.status === "HUMAN" && (
                <p className="text-xs text-muted-foreground">
                  El bot está en silencio en esta conversación — un asesor humano tiene el control hasta que la
                  devuelvas al bot.
                </p>
              )}

              <ul className="space-y-3">
                {selected.messages.map((m) => (
                  <li key={m.id} className={cn("flex", m.direction === "OUTBOUND" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-xs px-4 py-2.5 text-sm",
                        m.direction === "OUTBOUND" ? "bg-foreground text-background" : "bg-secondary",
                      )}
                    >
                      {m.content}
                      <p className="mt-1 text-[10px] opacity-60">{formatDateTime(m.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
