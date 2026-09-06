"use client";

import Link from "next/link";
import { X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Kits" },
  { href: "/#taller", label: "Taller" },
  { href: "/productos?tag=OFERTA", label: "Ofertas" },
  { href: "/contacto", label: "Contacto" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-black/70 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <nav
        className={`fixed right-0 top-0 z-[85] h-full w-72 max-w-[80vw] bg-carbon-800 border-l border-white/10 p-6 transition-transform md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display font-bold text-white">Menú</span>
          <button onClick={onClose} aria-label="Cerrar menú" className="text-neutral-400 hover:text-white">
            <X size={22} />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-3 text-lg text-neutral-200 hover:bg-white/5 hover:text-racing-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
