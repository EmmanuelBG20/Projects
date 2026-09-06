import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TicketStatusSelect } from "@/components/admin/ticket-status-select";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicketStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Soporte" };
export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true } } },
  });

  if (tickets.length === 0) {
    return <EmptyState icon={LifeBuoy} title="No hay tickets de soporte" description="Aparecerán aquí cuando un cliente escriba desde la tienda o escale una conversación de WhatsApp." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Soporte</h1>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-sm">
                  {t.user?.name ?? t.email ?? t.phone ?? "—"}
                  {t.source === "WHATSAPP" && t.phone && (
                    <Link href={`/admin/whatsapp?phone=${encodeURIComponent(t.phone)}`} className="ml-2 text-xs text-muted-foreground underline">
                      ver chat
                    </Link>
                  )}
                </TableCell>
                <TableCell className="max-w-xs text-sm">
                  <p className="font-medium">{t.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.message}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t.source}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</TableCell>
                <TableCell>
                  <TicketStatusSelect ticketId={t.id} status={t.status as SupportTicketStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
