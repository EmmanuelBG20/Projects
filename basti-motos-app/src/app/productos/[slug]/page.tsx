import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/product-mappers";
import { centsToCOP } from "@/lib/money";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { ProductCard } from "@/components/product/ProductCard";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { ReviewForm } from "@/components/product/ReviewForm";

type Params = Promise<{ slug: string }>;

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      brand: true,
      category: true,
      relatedTo: { include: { images: true, brand: true, category: true } },
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — BASTI MOTOS`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isActive) notFound();

  return (
    <div className="container-app py-12">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/productos" className="hover:text-white">Catálogo</Link>
        <span className="mx-2">/</span>
        <Link href={`/categorias/${product.category.slug}`} className="hover:text-white">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-500">{product.brand.name}</p>
          <h1 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-neutral-400">
              {product.rating.toFixed(1)} ({product.reviewCount} reseñas)
            </span>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-3 flex gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} tag={tag} />
              ))}
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-white">{centsToCOP(product.priceCents)}</span>
            {product.compareAtPriceCents && (
              <span className="text-lg text-neutral-500 line-through">
                {centsToCOP(product.compareAtPriceCents)}
              </span>
            )}
          </div>

          <p className="mt-4 text-neutral-300">{product.shortDescription}</p>

          <div className="mt-6">
            <AddToCartPanel product={toProductCardData(product)} />
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="mb-2 font-display font-bold text-white">Descripción</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-400">{product.description}</p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="glass-card p-3">
              <dt className="text-neutral-500">SKU</dt>
              <dd className="font-medium text-white">{product.sku}</dd>
            </div>
            <div className="glass-card p-3">
              <dt className="text-neutral-500">Categoría</dt>
              <dd className="font-medium text-white">{product.category.name}</dd>
            </div>
          </dl>
        </div>
      </div>

      {product.relatedTo.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title">Productos compatibles</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedTo.map((related) => (
              <ProductCard key={related.id} product={toProductCardData(related)} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 max-w-2xl">
        <h2 className="section-title">Reseñas de riders</h2>
        <div className="mb-6">
          <ReviewForm productId={product.id} />
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-neutral-400">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{review.user.name}</p>
                  <RatingStars rating={review.rating} size={14} />
                </div>
                <p className="mt-2 text-sm text-neutral-300">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
