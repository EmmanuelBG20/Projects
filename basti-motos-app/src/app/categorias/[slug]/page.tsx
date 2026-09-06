import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/product-mappers";
import { ProductCard } from "@/components/product/ProductCard";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: `${category.name} — BASTI MOTOS`, description: category.description ?? undefined };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true },
    include: { images: true, brand: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-app py-12">
      <div className="mb-10">
        <span className="section-tag">Categoría</span>
        <h1 className="section-title">{category.name}</h1>
        {category.description && <p className="section-subtitle mb-0">{category.description}</p>}
      </div>

      {products.length === 0 ? (
        <p className="glass-card p-8 text-center text-neutral-400">
          Todavía no hay productos publicados en esta categoría.
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
