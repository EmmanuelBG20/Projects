import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NuevoProductoPage() {
  const [categories, brands, otherProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="section-title">Nuevo producto</h1>
      <p className="section-subtitle">
        Guarda el producto primero; después de crearlo podrás subir sus imágenes.
      </p>
      <ProductForm categories={categories} brands={brands} otherProducts={otherProducts} />
    </div>
  );
}
