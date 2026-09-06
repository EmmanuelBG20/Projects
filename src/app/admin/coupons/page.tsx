import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateCouponDialog } from "@/components/admin/create-coupon-dialog";
import { CouponToggleButton } from "@/components/admin/coupon-toggle-button";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Cupones" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Cupones</h1>
        <CreateCouponDialog />
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-sm font-medium">{c.code}</TableCell>
                <TableCell className="text-sm">{c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(c.value)}</TableCell>
                <TableCell className="text-sm tabular-nums">
                  {c.usedCount}
                  {c.maxUses ? ` / ${c.maxUses}` : ""}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.expiresAt ? `Hasta ${formatDate(c.expiresAt)}` : "Sin expiración"}
                </TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "muted"}>{c.isActive ? "Activo" : "Inactivo"}</Badge>
                </TableCell>
                <TableCell>
                  <CouponToggleButton couponId={c.id} isActive={c.isActive} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
