"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { centsToPlainCOP } from "@/lib/money";
import type { CartLineView } from "@/types";

export function CartItemRow({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineView;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-3 border-b border-white/10 py-4">
      <Link href={`/productos/${line.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-carbon-700">
        {line.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/productos/${line.slug}`} className="line-clamp-2 text-sm font-medium text-white hover:text-racing-orange">
          {line.name}
        </Link>
        <p className="mt-1 text-sm font-semibold text-racing-orange">{centsToPlainCOP(line.unitPriceCents)}</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-1">
            <button
              aria-label="Disminuir cantidad"
              onClick={() => onQuantityChange(line.quantity - 1)}
              className="rounded-full p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm text-white">{line.quantity}</span>
            <button
              aria-label="Aumentar cantidad"
              disabled={line.quantity >= line.stock}
              onClick={() => onQuantityChange(line.quantity + 1)}
              className="rounded-full p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            aria-label="Eliminar producto"
            onClick={onRemove}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-racing-red/10 hover:text-racing-red"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
