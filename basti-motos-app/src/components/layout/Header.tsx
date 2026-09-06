"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchBox } from "@/components/layout/SearchBox";
import { UserMenu } from "@/components/layout/UserMenu";
import { useCartStore } from "@/store/cart-store";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Kits" },
  { href: "/#taller", label: "Taller" },
  { href: "/productos?tag=OFERTA", label: "Ofertas" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    // `MobileMenu` se renderiza FUERA de <header> a propósito: el header usa
    // `backdrop-blur`, y un `backdrop-filter`/`filter`/`transform` en un
    // ancestro crea un containing block nuevo para sus descendientes
    // `fixed`, así que un overlay `fixed inset-0` anidado adentro terminaría
    // limitado a la altura del header (80px) en vez de cubrir toda la
    // pantalla.
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-carbon-900/90 backdrop-blur-md">
        <div className="container-app relative flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 flex-col leading-none">
            <span className="font-display text-xl font-black tracking-wide text-white">
              BASTI<span className="text-racing-orange"> MOTOS</span>
            </span>
            <span className="hidden text-[11px] uppercase tracking-widest text-neutral-400 sm:block">
              Performance &amp; Care for Riders
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="rounded-full p-2 text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              <Search size={20} />
            </button>

            <UserMenu />

            <button
              onClick={openDrawer}
              aria-label="Abrir carrito"
              className="relative rounded-full p-2 text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-racing-orange px-1 text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="rounded-full p-2 text-neutral-300 hover:bg-white/5 hover:text-white md:hidden"
            >
              <Menu size={22} />
            </button>
          </div>

          {searchOpen && <SearchBox onClose={() => setSearchOpen(false)} />}
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
