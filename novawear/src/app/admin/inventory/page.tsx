import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { availableQuantity } from "@/lib/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryRowActions } from "@/components/admin/inventory-row-actions";

export const metadata: Metadata = { title: "Inventario" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const inventories = await prisma.inventory.findMany({
    include: { variant: { include: { product: true } } },
    orderBy: { variant: { product: { name: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Inventario</h1>
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead>Stock físico</TableHead>
              <TableHead>Reservado</TableHead>
              <TableHead>Disponible</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventories.map((inv) => {
              const available = availableQuantity(inv);
              const low = available <= inv.lowStockThreshold;
              return (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm">{inv.variant.product.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.variant.color} / {inv.variant.size}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{inv.quantity}</TableCell>
                  <TableCell className="text-sm tabular-nums">{inv.reserved}</TableCell>
                  <TableCell>
                    <Badge variant={available === 0 ? "destructive" : low ? "rust" : "success"}>{available}</Badge>
                  </TableCell>
                  <TableCell>
                    <InventoryRowActions variantId={inv.variantId} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
