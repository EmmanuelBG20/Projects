import Link from "next/link";
import { Droplet, Link2, Disc, SprayCan, Wrench, HardHat, Zap, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/ui/Reveal";

const ICONS: Record<string, LucideIcon> = {
  "oil-can": Droplet,
  link: Link2,
  disc: Disc,
  "spray-can": SprayCan,
  wrench: Wrench,
  helmet: HardHat,
  bolt: Zap,
};

export async function Categorias() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <section id="categorias" className="border-b border-white/10 py-20">
      <div className="container-app">
        <Reveal>
          <span className="section-tag">Catálogo</span>
          <h2 className="section-title">Categorías principales</h2>
          <p className="section-subtitle">Todo lo que tu moto necesita, organizado por especialidad.</p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = ICONS[category.icon ?? ""] ?? Wrench;
            return (
              <Reveal key={category.id}>
                <Link
                  href={`/categorias/${category.slug}`}
                  className="glass-card group flex h-full flex-col p-6 transition-transform hover:-translate-y-1 hover:border-racing-orange/40"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-racing-orange/10 text-racing-orange">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-racing-orange">
                    {category.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-neutral-400">{category.description}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
