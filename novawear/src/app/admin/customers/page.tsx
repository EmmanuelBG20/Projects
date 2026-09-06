import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { orders: { select: { total: true, status: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Clientes</h1>
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Total comprado</TableHead>
              <TableHead>Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const validOrders = c.orders.filter((o) => o.status !== "CANCELLED");
              const totalSpent = validOrders.reduce((sum, o) => sum + o.total, 0);
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-sm font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm tabular-nums">{validOrders.length}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatPrice(totalSpent)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
