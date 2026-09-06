"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setConversationStatusAction } from "@/lib/actions/admin/support";
import { Button } from "@/components/ui/button";

export function ConversationStatusToggle({
  conversationId,
  status,
}: {
  conversationId: string;
  status: "BOT" | "HUMAN" | "CLOSED";
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: "BOT" | "HUMAN" | "CLOSED") {
    startTransition(async () => {
      const res = await setConversationStatusAction({ conversationId, status: next });
      if (res.error) toast.error(res.error);
      else toast.success(next === "BOT" ? "Conversación devuelta al bot" : "Conversación tomada");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "BOT" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => setStatus("BOT")}>
          Devolver al bot
        </Button>
      )}
      {status !== "HUMAN" && (
        <Button size="sm" disabled={isPending} onClick={() => setStatus("HUMAN")}>
          Tomar conversación
        </Button>
      )}
      {status !== "CLOSED" && (
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setStatus("CLOSED")}>
          Cerrar
        </Button>
      )}
    </div>
  );
}
