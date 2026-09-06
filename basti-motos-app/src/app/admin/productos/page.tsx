import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title mb-0">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
