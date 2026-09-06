import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Búsqueda rápida usada por el buscador del header (autocompletado). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, brand: true },
    take: 8,
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceCents: p.priceCents,
      brandName: p.brand.name,
      imageUrl: p.images[0]?.url ?? null,
    })),
  });
}
