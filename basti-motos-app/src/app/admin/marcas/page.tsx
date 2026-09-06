import { prisma } from "@/lib/prisma";
import { BrandsManager } from "@/components/admin/BrandsManager";

export default async function AdminMarcasPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return <BrandsManager brands={brands} />;
}
