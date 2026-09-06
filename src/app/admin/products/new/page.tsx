import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
