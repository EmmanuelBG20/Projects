import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/session";
import { availableQuantity } from "@/lib/inventory";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGallery } from "@/components/product/gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { ProductAccordions } from "@/components/product/product-accordions";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductRail } from "@/components/home/product-rail";
import { prisma } from "@/lib/prisma";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, user] = await Promise.all([getProductBySlug(params.slug), getCurrentUser()]);
  if (!product || product.status !== "ACTIVE") notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  const variants = product.variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    colorHex: v.colorHex,
    priceOverride: v.priceOverride,
    available: v.inventory ? availableQuantity(v.inventory) : 0,
  }));

  let wishlisted = false;
  if (user) {
    const item = await prisma.wishlistItem.findFirst({
      where: { productId: product.id, wishlist: { userId: user.id } },
    });
    wishlisted = Boolean(item);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    brand: { "@type": "Brand", name: "NOVAWEAR" },
    offers: {
      "@type": "Offer",
      url: `${appUrl}/product/${product.slug}`,
      priceCurrency: "COP",
      price: product.price,
      availability: variants.some((v) => v.available > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="container py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Tienda", href: "/shop" },
            { label: product.category.name, href: `/shop/${product.category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">{product.category.name}</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-6">
            <VariantSelector
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              categoryName={product.category.name}
              variants={variants}
              initialWishlisted={wishlisted}
            />
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          {product.story && (
            <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">{product.story}</p>
          )}

          <ProductAccordions material={product.material ?? ""} careInstructions={product.careInstructions ?? ""} />
        </div>
      </div>

      <div className="mt-20 border-t border-border pt-14">
        <h2 className="mb-8 font-display text-2xl">Reseñas</h2>
        <ReviewsSection
          productId={product.id}
          avgRating={product.avgRating}
          canReview={Boolean(user)}
          reviews={product.reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            isVerifiedPurchase: r.isVerifiedPurchase,
            createdAt: r.createdAt,
            user: { name: r.user.name },
          }))}
        />
      </div>

      <div className="mt-20 border-t border-border pt-14">
        <ProductRail title="También te puede gustar" products={related} />
      </div>
    </div>
  );
}
