"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Resumen" },
  { href: "/account/orders", label: "Mis pedidos" },
  { href: "/account/wishlist", label: "Favoritos" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-6 border-b border-border lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:pr-6">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-b-2 border-transparent py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground lg:border-b-0 lg:border-l-2 lg:py-2 lg:pl-4",
              active && "border-foreground text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
