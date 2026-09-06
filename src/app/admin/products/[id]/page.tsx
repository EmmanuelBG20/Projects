import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { position: "asc" } }, variants: { include: { inventory: true }, orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl">{product.name}</h1>
      <ProductForm
        categories={categories}
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          description: product.description,
          story: product.story ?? "",
          material: product.material ?? "",
          careInstructions: product.careInstructions ?? "",
          status: product.status as never,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex ?? "",
            quantity: v.inventory?.quantity ?? 0,
          })),
        }}
      />
    </div>
  );
}
