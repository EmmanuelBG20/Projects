import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatPrice } from "@/lib/utils";
import type { ProductStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Productos" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<ProductStatus, "success" | "muted" | "outline"> = {
  ACTIVE: "success",
  DRAFT: "muted",
  ARCHIVED: "outline",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: { include: { inventory: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const totalStock = p.variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-secondary">
                        {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="40px" className="object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category.name}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{totalStock}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[p.status as ProductStatus]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <ProductRowActions productId={p.id} status={p.status as ProductStatus} />
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
