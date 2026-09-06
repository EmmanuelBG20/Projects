"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toggleProductActiveAction, deleteProductAction } from "@/actions/product.actions";
import { useToast } from "@/components/ui/Toast";
import { centsToCOP } from "@/lib/money";
import type { Product, Category, Brand } from "@prisma/client";

type Row = Product & { category: Category; brand: Brand };

export function ProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const { push } = useToast();

  async function handleToggle(id: string, isActive: boolean) {
    await toggleProductActiveAction(id, !isActive);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const result = await deleteProductAction(id);
    if (result.softDeleted) {
      push("El producto tiene pedidos asociados: se desactivó en vez de eliminarse.", "info");
    } else {
      push("Producto eliminado", "success");
    }
    router.refresh();
  }

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 text-neutral-400">
          <tr>
            <th className="p-4">Producto</th>
            <th className="p-4">Categoría</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Estado</th>
            <th className="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-4">
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-xs text-neutral-500">{product.brand.name} · {product.sku}</p>
              </td>
              <td className="p-4 text-neutral-300">{product.category.name}</td>
              <td className="p-4 text-neutral-300">{centsToCOP(product.priceCents)}</td>
              <td className={`p-4 ${product.stock <= 5 ? "text-racing-red" : "text-neutral-300"}`}>{product.stock}</td>
              <td className="p-4">
                <button
                  onClick={() => handleToggle(product.id, product.isActive)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.isActive ? "bg-neon-green/15 text-neon-green" : "bg-white/10 text-neutral-400"
                  }`}
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </button>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Link href={`/admin/productos/${product.id}/editar`} className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:text-white">
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:border-racing-red hover:text-racing-red"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
