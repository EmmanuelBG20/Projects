"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { User, LogOut, Package, MapPin, ShieldCheck } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status !== "authenticated" || !session?.user) {
    return (
      <Link
        href="/iniciar-sesion"
        aria-label="Iniciar sesión"
        className="rounded-full p-2 text-neutral-300 hover:bg-white/5 hover:text-white"
      >
        <User size={20} />
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className="rounded-full p-2 text-neutral-300 hover:bg-white/5 hover:text-white"
      >
        <User size={20} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-carbon-800 shadow-card">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{session.user.name}</p>
            <p className="truncate text-xs text-neutral-400">{session.user.email}</p>
          </div>
          <nav className="py-1">
            <Link href="/mi-cuenta" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-200 hover:bg-white/5">
              <User size={16} /> Mi cuenta
            </Link>
            <Link href="/mi-cuenta/pedidos" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-200 hover:bg-white/5">
              <Package size={16} /> Mis pedidos
            </Link>
            <Link href="/mi-cuenta/direcciones" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-200 hover:bg-white/5">
              <MapPin size={16} /> Direcciones
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-racing-orange hover:bg-white/5">
                <ShieldCheck size={16} /> Panel admin
              </Link>
            )}
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-white/5"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
