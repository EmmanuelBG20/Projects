"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setTicketStatusAction } from "@/lib/actions/admin/support";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORT_TICKET_STATUSES, type SupportTicketStatus } from "@/lib/constants";

const LABELS: Record<SupportTicketStatus, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

export function TicketStatusSelect({ ticketId, status }: { ticketId: string; status: SupportTicketStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onChange(next: string) {
    startTransition(async () => {
      const res = await setTicketStatusAction({ ticketId, status: next });
      if (res.error) toast.error(res.error);
      router.refresh();
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="h-9 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORT_TICKET_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
