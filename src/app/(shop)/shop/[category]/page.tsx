import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopContent, type ShopSearchParams } from "@/app/(shop)/shop/shop-content";

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.category } });
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Compra ${category.name} en NOVAWEAR.`,
  };
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: ShopSearchParams;
}) {
  const category = await prisma.category.findUnique({ where: { slug: params.category } });
  if (!category) notFound();

  return <ShopContent categorySlug={params.category} searchParams={searchParams} />;
}
