"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  BadgePercent,
  ClipboardList,
  Ticket,
  Boxes,
  BarChart3,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: BadgePercent },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="glass-card flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-1 lg:overflow-visible">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
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
