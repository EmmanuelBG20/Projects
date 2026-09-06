"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="container-app flex flex-col items-center gap-4 py-32 text-center">
      <AlertTriangle size={48} className="text-racing-red" />
      <h1 className="font-display text-2xl font-bold text-white">Algo salió mal</h1>
      <p className="max-w-md text-neutral-400">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Intentar de nuevo
        </button>
        <Link href="/" className="btn-ghost">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
