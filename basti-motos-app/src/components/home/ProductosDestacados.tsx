import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/product-mappers";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export async function ProductosDestacados() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { images: true, brand: true, category: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="border-b border-white/10 py-20">
      <div className="container-app">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-tag">Más vendidos</span>
            <h2 className="section-title">Productos destacados</h2>
            <p className="section-subtitle mb-0">Seleccionados y probados por riders reales.</p>
          </div>
          <Link href="/productos" className="btn-ghost">
            Ver todo el catálogo
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Reveal key={product.id}>
              <ProductCard product={toProductCardData(product)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
