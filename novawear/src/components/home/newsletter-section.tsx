import { NewsletterForm } from "@/components/home/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="container py-20 sm:py-28">
      <div className="flex flex-col items-center gap-6 border border-border px-8 py-16 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Newsletter</p>
        <h2 className="max-w-lg font-display text-3xl tracking-tight sm:text-4xl">
          Sé el primero en enterarte de nuevos lanzamientos
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Un correo al mes, sin spam: acceso anticipado a colecciones y descuentos exclusivos para suscriptores.
        </p>
        <div className="w-full max-w-sm [&_input]:border-input [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_button]:border-foreground [&_button]:text-foreground [&_button:hover]:bg-foreground [&_button:hover]:text-background">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
