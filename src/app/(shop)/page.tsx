import { getFeaturedProducts, getNewArrivals, getTopCategories } from "@/lib/products";
import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { ProductRail } from "@/components/home/product-rail";
import { PromoBanner } from "@/components/home/promo-banner";
import { Benefits } from "@/components/home/benefits";
import { NewsletterSection } from "@/components/home/newsletter-section";

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getTopCategories(),
  ]);

  return (
    <>
      <Hero />
      <ProductRail eyebrow="Seleccionados" title="Destacados" href="/shop" products={featured} />
      <FeaturedCollections categories={categories} />
      <ProductRail eyebrow="Recién llegado" title="Nuevos lanzamientos" href="/shop?sort=newest" products={newArrivals} />
      <PromoBanner />
      <Benefits />
      <NewsletterSection />
    </>
  );
}
