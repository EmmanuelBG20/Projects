import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/product-mappers";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import type { Prisma, ProductTag } from "@prisma/client";

export const metadata: Metadata = {
  title: "Catálogo de productos — BASTI MOTOS",
  description: "Explora kits, herramientas y accesorios de mantenimiento para tu motocicleta.",
};

type SearchParams = Promise<{
  categoria?: string;
  marca?: string;
  tag?: string;
  orden?: string;
}>;

export default async function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (sp.categoria) where.category = { slug: sp.categoria };
  if (sp.marca) where.brand = { slug: sp.marca };
  if (sp.tag) where.tags = { has: sp.tag as ProductTag };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sp.orden === "precio-asc") orderBy = { priceCents: "asc" };
  if (sp.orden === "precio-desc") orderBy = { priceCents: "desc" };
  if (sp.orden === "nombre") orderBy = { name: "asc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { images: true, brand: true, category: true },
  });

  return (
    <div className="container-app py-12">
      <div className="mb-8">
        <span className="section-tag">Catálogo</span>
        <h1 className="section-title">Todos los productos</h1>
        <p className="section-subtitle mb-0">{products.length} productos disponibles</p>
      </div>

      <div className="mb-8">
        <ProductFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
        />
      </div>

      {products.length === 0 ? (
        <p className="glass-card p-8 text-center text-neutral-400">
          No encontramos productos con esos filtros. Prueba ajustando la búsqueda.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={toProductCardData(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
