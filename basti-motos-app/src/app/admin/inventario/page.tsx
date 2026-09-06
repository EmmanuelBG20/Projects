import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function AdminInventarioPage() {
  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { stock: "asc" },
  });

  return (
    <div>
      <h1 className="section-title">Inventario</h1>
      <p className="section-subtitle">Actualiza el stock disponible de cada producto.</p>
      <InventoryTable products={products} />
    </div>
  );
}
