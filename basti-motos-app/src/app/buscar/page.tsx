import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/product-mappers";
import { ProductCard } from "@/components/product/ProductCard";

type SearchParams = Promise<{ q?: string }>;

export default async function BuscarPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const products = query.length >= 2
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: { images: true, brand: true, category: true },
      })
    : [];

  return (
    <div className="container-app py-12">
      <div className="mb-8">
        <span className="section-tag">Resultados</span>
        <h1 className="section-title">
          {query ? `Búsqueda: "${query}"` : "Escribe algo para buscar"}
        </h1>
        <p className="section-subtitle mb-0">{products.length} resultados encontrados</p>
      </div>

      {query.length >= 2 && products.length === 0 && (
        <p className="glass-card p-8 text-center text-neutral-400">
          No encontramos productos que coincidan con &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={toProductCardData(product)} />
        ))}
      </div>
    </div>
  );
}
