import Link from "next/link";
import { NewsletterForm } from "@/components/home/newsletter-form";

const COLUMNS = [
  {
    title: "Tienda",
    links: [
      { href: "/shop", label: "Todo" },
      { href: "/shop/camisetas", label: "Camisetas" },
      { href: "/shop/hoodies", label: "Hoodies" },
      { href: "/shop/pantalones", label: "Pantalones" },
      { href: "/shop/chaquetas", label: "Chaquetas" },
      { href: "/shop/accesorios", label: "Accesorios" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/shop", label: "Guía de tallas" },
      { href: "/account/orders", label: "Rastrear pedido" },
      { href: "/checkout", label: "Envíos y devoluciones" },
      { href: "/", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { href: "/", label: "Sobre NOVAWEAR" },
      { href: "/", label: "Sostenibilidad" },
      { href: "/", label: "Trabaja con nosotros" },
      { href: "/", label: "Prensa" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <p className="font-display text-2xl tracking-wide">NOVAWEAR</p>
          <p className="max-w-xs text-sm text-primary-foreground/70">
            Prendas esenciales, hechas para durar. Diseñadas en Bogotá, pensadas para el mundo.
          </p>
          <NewsletterForm />
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/50">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-primary-foreground/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} NOVAWEAR. Proyecto de portafolio — no es una tienda real.</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-primary-foreground">Términos</Link>
            <Link href="/" className="hover:text-primary-foreground">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
