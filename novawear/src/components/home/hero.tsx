import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex h-[88vh] min-h-[560px] items-end overflow-hidden bg-primary">
      <Image
        src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1800&q=80"
        alt="Colección NOVAWEAR"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="container relative z-10 pb-16 text-primary-foreground sm:pb-24">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/70">
          Colección FW26
        </p>
        <h1 className="max-w-xl font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Esenciales que resisten el tiempo
        </h1>
        <p className="mt-5 max-w-md text-sm text-primary-foreground/80 sm:text-base">
          Prendas diseñadas con materiales premium y un enfoque minimalista. Hechas para durar, no para una temporada.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
            <Link href="/shop">Ver colección</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <Link href="/shop/hoodies">Explorar hoodies</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
