import Link from "next/link";
import { CircleOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-app flex flex-col items-center gap-4 py-32 text-center">
      <CircleOff size={48} className="text-racing-orange" />
      <h1 className="font-display text-3xl font-black text-white">404</h1>
      <p className="max-w-md text-neutral-400">
        No encontramos la página que buscas. Puede que el producto ya no esté disponible o el enlace esté mal escrito.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
