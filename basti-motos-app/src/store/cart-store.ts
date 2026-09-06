import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineView } from "@/types";

type CartState = {
  lines: CartLineView[];
  hasSyncedWithServer: boolean;
  isDrawerOpen: boolean;
  setLines: (lines: CartLineView[]) => void;
  addOrUpdateLine: (line: CartLineView) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  markSynced: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  itemCount: () => number;
  subtotalCents: () => number;
};

/**
 * Fuente de verdad del carrito EN EL CLIENTE. Para invitados es la única
 * fuente (persistida en localStorage). Para usuarios autenticados, este
 * store se hidrata desde la base de datos (ver CartSyncProvider) y cada
 * mutación llama también al Server Action correspondiente; lo mantenemos
 * aquí igual para que el header y el drawer del carrito respondan al
 * instante sin esperar un round-trip al servidor.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hasSyncedWithServer: false,
      isDrawerOpen: false,

      setLines: (lines) => set({ lines }),

      addOrUpdateLine: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            const quantity = Math.min(existing.quantity + line.quantity, line.stock, 20);
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, quantity, lineTotalCents: quantity * l.unitPriceCents }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId
                    ? { ...l, quantity, lineTotalCents: quantity * l.unitPriceCents }
                    : l
                ),
        })),

      removeLine: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

      clear: () => set({ lines: [], hasSyncedWithServer: false }),

      markSynced: () => set({ hasSyncedWithServer: true }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotalCents: () => get().lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
    }),
    {
      name: "basti-motos-cart",
      partialize: (state) => ({ lines: state.lines, hasSyncedWithServer: state.hasSyncedWithServer }),
    }
  )
);
