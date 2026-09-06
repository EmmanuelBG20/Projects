import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: { select: { name: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Reviews</h1>
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm">{r.product.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.user.name}</TableCell>
                <TableCell className="text-sm">{"★".repeat(r.rating)}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{r.comment}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={r.isApproved ? "success" : "muted"}>{r.isApproved ? "Visible" : "Oculta"}</Badge>
                </TableCell>
                <TableCell>
                  <ReviewRowActions reviewId={r.id} isApproved={r.isApproved} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
