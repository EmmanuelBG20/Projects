"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateStockAction } from "@/actions/product.actions";
import { useToast } from "@/components/ui/Toast";
import type { Product, Brand } from "@prisma/client";

const LOW_STOCK_THRESHOLD = 5;

export function InventoryTable({ products }: { products: (Product & { brand: Brand })[] }) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, p.stock]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();

  async function handleSave(id: string) {
    setSavingId(id);
    const result = await updateStockAction(id, values[id] ?? 0);
    setSavingId(null);

    if (!result.success) {
      push(result.error ?? "No se pudo actualizar el stock", "error");
      return;
    }
    push("Stock actualizado", "success");
    router.refresh();
  }

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-white/10 text-neutral-400">
          <tr>
            <th className="p-4">Producto</th>
            <th className="p-4">SKU</th>
            <th className="p-4">Stock actual</th>
            <th className="p-4">Nuevo stock</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-4">
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-xs text-neutral-500">{product.brand.name}</p>
              </td>
              <td className="p-4 text-neutral-400">{product.sku}</td>
              <td className="p-4">
                <span className={product.stock <= LOW_STOCK_THRESHOLD ? "font-semibold text-racing-red" : "text-neutral-300"}>
                  {product.stock}
                </span>
              </td>
              <td className="p-4">
                <input
                  type="number"
                  min={0}
                  value={values[product.id]}
                  onChange={(e) => setValues((v) => ({ ...v, [product.id]: Number(e.target.value) }))}
                  className="input-field w-24 py-1.5"
                />
              </td>
              <td className="p-4">
                <button
                  onClick={() => handleSave(product.id)}
                  disabled={savingId === product.id || values[product.id] === product.stock}
                  className="rounded-lg border border-white/10 p-2 text-neutral-300 hover:border-racing-orange hover:text-racing-orange disabled:opacity-30"
                  aria-label="Guardar stock"
                >
                  <Save size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
