"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function MobileMenu({ categories }: { categories: { name: string; slug: string }[] }) {
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const toggle = useUIStore((s) => s.toggleMobileMenu);

  return (
    <>
      <button
        aria-label="Abrir menú"
        onClick={() => toggle(true)}
        className="flex h-10 w-10 items-center justify-center text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <Sheet open={isOpen} onOpenChange={(open) => toggle(open)}>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader>
            <SheetTitle className="font-display text-xl tracking-wide">NOVAWEAR</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-4">
            <Link href="/shop" onClick={() => toggle(false)} className="py-3 text-sm uppercase tracking-widest">
              Todo
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                onClick={() => toggle(false)}
                className="py-3 text-sm uppercase tracking-widest"
              >
                {c.name}
              </Link>
            ))}
            <Separator className="my-3" />
            <Link href="/account" onClick={() => toggle(false)} className="py-3 text-sm text-muted-foreground">
              Mi cuenta
            </Link>
            <Link href="/account/orders" onClick={() => toggle(false)} className="py-3 text-sm text-muted-foreground">
              Mis pedidos
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
