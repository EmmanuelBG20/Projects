"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { getDemoChatHistory, sendDemoChatMessageAction, type DemoChatMessage } from "@/lib/actions/whatsapp-demo";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nw_whatsapp_demo_session";

function getOrCreateSessionId() {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // Private browsing / storage blocked — fall back to an in-memory id that
    // just won't survive a refresh.
    return crypto.randomUUID();
  }
}

export function WhatsAppChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DemoChatMessage[]>([]);
  const [status, setStatus] = useState<"BOT" | "HUMAN" | "CLOSED">("BOT");
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (!open || !sessionId || loaded) return;
    getDemoChatHistory(sessionId).then((res) => {
      setMessages(res.messages);
      setStatus(res.status);
      setLoaded(true);
    });
  }, [open, sessionId, loaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function send() {
    const text = input.trim();
    if (!text || !sessionId || isPending) return;

    const optimistic: DemoChatMessage = {
      id: `local-${Date.now()}`,
      direction: "INBOUND",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    startTransition(async () => {
      const res = await sendDemoChatMessageAction(sessionId, text);
      if (res.status) setStatus(res.status);
      if (res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-reply-${Date.now()}`,
            direction: "OUTBOUND",
            content: res.reply!,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else if (res.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-error-${Date.now()}`,
            direction: "OUTBOUND",
            content: `⚠️ ${res.error}`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[520px] w-[340px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden border border-border bg-background shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4">
          <div className="flex items-center justify-between bg-[#25D366] px-4 py-3.5 text-white">
            <div>
              <p className="text-sm font-medium">NOVAWEAR — Asistente</p>
              <p className="text-[11px] opacity-90">
                {status === "HUMAN" ? "Un asesor humano tomó la conversación" : "Bot · demo del asistente de WhatsApp"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat" className="opacity-90 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#e5ded5] p-4">
            {messages.length === 0 && !isPending && (
              <p className="text-center text-xs text-muted-foreground">
                Escríbele al asistente — prueba &quot;hola&quot;, &quot;quiero un hoodie negro&quot; o &quot;dónde
                está mi pedido&quot;.
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.direction === "INBOUND" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded px-3 py-2 text-sm shadow-sm",
                    m.direction === "INBOUND" ? "bg-[#dcf8c6]" : "bg-white",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="rounded bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">escribiendo…</div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border bg-background p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje…"
              className="h-10 flex-1 border border-input bg-background px-3 text-sm focus:outline-none focus:border-foreground"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-foreground text-background transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat con el asistente"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
