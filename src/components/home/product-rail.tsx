import { SectionHeading } from "@/components/home/section-heading";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";

export function ProductRail({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="container py-16 sm:py-20">
      <SectionHeading eyebrow={eyebrow} title={title} href={href} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
