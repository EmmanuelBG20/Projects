import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/home/section-heading";

interface Collection {
  name: string;
  slug: string;
  image: string | null;
}

export function FeaturedCollections({ categories }: { categories: Collection[] }) {
  return (
    <section className="container py-20 sm:py-28">
      <SectionHeading eyebrow="Explora" title="Compra por categoría" href="/shop" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((c) => (
          <Link key={c.slug} href={`/shop/${c.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-secondary">
            {c.image && (
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
            <span className="absolute bottom-4 left-4 text-sm font-medium uppercase tracking-widest text-white">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
