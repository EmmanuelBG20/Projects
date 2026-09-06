"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Ticket,
  Star,
  BarChart3,
  Plug,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/inventory", label: "Inventario", icon: Warehouse },
  { href: "/admin/coupons", label: "Cupones", icon: Ticket },
  { href: "/admin/support", label: "Soporte", icon: LifeBuoy },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/integrations", label: "Integraciones", icon: Plug },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border lg:block">
      <div className="flex h-16 items-center px-6">
        <Link href="/admin" className="font-display text-lg tracking-wide">
          NOVAWEAR <span className="text-muted-foreground">admin</span>
        </Link>
      </div>
      <nav className="space-y-0.5 px-3">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.5} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
