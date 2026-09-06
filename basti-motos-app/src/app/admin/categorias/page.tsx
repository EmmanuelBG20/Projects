import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <CategoriesManager categories={categories} />;
}
