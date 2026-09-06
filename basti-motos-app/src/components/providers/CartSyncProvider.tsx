"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { mergeGuestCartAction, getCartSummaryAction } from "@/actions/cart.actions";

/**
 * Sincroniza el carrito de invitado (localStorage) con la base de datos justo
 * al detectar una sesión autenticada, y limpia el carrito local al cerrar
 * sesión (para que el siguiente invitado no vea el carrito de otro usuario
 * en el mismo navegador).
 *
 * `hasSyncedWithServer` vive en el store persistido (no en un ref local):
 * una recarga completa de página vuelve a montar este componente, así que un
 * ref se reiniciaría en cada carga y volvería a fusionar el mismo carrito
 * local una y otra vez, duplicando cantidades en la base de datos.
 */
export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const setLines = useCartStore((s) => s.setLines);
  const clear = useCartStore((s) => s.clear);
  const markSynced = useCartStore((s) => s.markSynced);
  const runningRef = useRef(false);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (status === "authenticated" && !runningRef.current) {
      runningRef.current = true;

      (async () => {
        const alreadySynced = useCartStore.getState().hasSyncedWithServer;

        if (!alreadySynced) {
          const guestLines = useCartStore.getState().lines;
          const guestItems = guestLines.map((l) => ({ productId: l.productId, quantity: l.quantity }));
          if (guestItems.length > 0) {
            await mergeGuestCartAction(guestItems);
          }
          markSynced();
        }

        // Siempre refrescamos desde el servidor (sin volver a fusionar) para
        // que el carrito refleje cambios hechos en otra pestaña o sesión.
        const summary = await getCartSummaryAction();
        setLines(summary.lines);
        runningRef.current = false;
      })();
    }

    if (prevStatusRef.current === "authenticated" && status === "unauthenticated") {
      clear();
    }

    prevStatusRef.current = status;
  }, [status, setLines, clear, markSynced]);

  return <>{children}</>;
}
