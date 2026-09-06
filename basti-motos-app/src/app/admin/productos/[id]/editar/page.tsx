import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Params = Promise<{ id: string }>;

export default async function EditarProductoPage({ params }: { params: Params }) {
  const { id } = await params;

  const [product, categories, brands, otherProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } }, relatedTo: { select: { id: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { NOT: { id } }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="section-title">Editar producto</h1>

      <div className="glass-card mb-6 p-6">
        <h2 className="mb-3 font-display font-bold text-white">Imágenes</h2>
        <ImageUploader productId={product.id} images={product.images} />
      </div>

      <ProductForm categories={categories} brands={brands} otherProducts={otherProducts} initialProduct={product} />
    </div>
  );
}
