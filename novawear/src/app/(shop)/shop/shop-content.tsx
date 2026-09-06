import { PackageSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getFilterOptions, listProducts } from "@/lib/products";
import { toArray } from "@/lib/validations/shop";
import { ProductCard } from "@/components/shop/product-card";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { MobileFilters } from "@/components/shop/mobile-filters";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";
import { EmptyState } from "@/components/shared/empty-state";

export interface ShopSearchParams {
  q?: string;
  size?: string | string[];
  color?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
}

export async function ShopContent({
  categorySlug,
  searchParams,
}: {
  categorySlug?: string;
  searchParams: ShopSearchParams;
}) {
  const sizes = toArray(searchParams.size);
  const colors = toArray(searchParams.color);
  const sortOptions = ["relevance", "price-asc", "price-desc", "newest"] as const;
  const sort = sortOptions.find((s) => s === searchParams.sort) ?? "relevance";
  const page = Number(searchParams.page) || 1;

  const [category, options, result] = await Promise.all([
    categorySlug ? prisma.category.findUnique({ where: { slug: categorySlug } }) : null,
    getFilterOptions(categorySlug),
    listProducts({
      categorySlug,
      q: searchParams.q,
      sizes,
      colors,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      inStockOnly: searchParams.inStock === "true",
      sort,
      page,
    }),
  ]);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (searchParams.q) params.set("q", searchParams.q);
    for (const s of sizes) params.append("size", s);
    for (const c of colors) params.append("color", c);
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
    if (searchParams.inStock) params.set("inStock", searchParams.inStock);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    const base = categorySlug ? `/shop/${categorySlug}` : "/shop";
    return qs ? `${base}?${qs}` : base;
  }

  const title = category?.name ?? (searchParams.q ? `Resultados para “${searchParams.q}”` : "Todo");

  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-10">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {result.total} {result.total === 1 ? "producto" : "productos"}
        </p>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
        {category?.description && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{category.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FiltersSidebar options={options} />
        </aside>

        <div>
          <div className="mb-8 flex items-center justify-between gap-3">
            <MobileFilters options={options} />
            <div className="ml-auto">
              <SortSelect />
            </div>
          </div>

          {result.products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No encontramos productos"
              description="Prueba a quitar algunos filtros o busca otra categoría."
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {result.products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}

          <Pagination page={result.page} pageCount={result.pageCount} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
