import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="container pb-20 sm:pb-28">
      <div className="relative flex min-h-[420px] items-center overflow-hidden bg-secondary">
        <Image
          src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80"
          alt="Chaquetas NOVAWEAR"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 max-w-md px-8 text-primary-foreground sm:px-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/70">
            Temporada fría
          </p>
          <h3 className="font-display text-3xl leading-tight sm:text-4xl">
            Capas exteriores para cada clima
          </h3>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Bombers, puffers y cortavientos empacables. Diseñados para acompañarte de la ciudad a la montaña.
          </p>
          <Button size="lg" asChild className="mt-6 bg-background text-foreground hover:bg-background/90">
            <Link href="/shop/chaquetas">Ver chaquetas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
