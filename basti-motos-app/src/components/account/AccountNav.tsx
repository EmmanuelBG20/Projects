"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/mi-cuenta", label: "Resumen", icon: LayoutDashboard },
  { href: "/mi-cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/mi-cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/mi-cuenta/perfil", label: "Mi perfil", icon: User },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-card flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-racing-orange/15 text-racing-orange" : "text-neutral-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={16} /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
