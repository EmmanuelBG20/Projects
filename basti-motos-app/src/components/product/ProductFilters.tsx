"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Facet = { slug: string; name: string };

export function ProductFilters({
  categories,
  brands,
}: {
  categories: Facet[];
  brands: Facet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentCategory = searchParams.get("categoria") ?? "";
  const currentBrand = searchParams.get("marca") ?? "";
  const currentTag = searchParams.get("tag") ?? "";
  const currentSort = searchParams.get("orden") ?? "";

  return (
    <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-center">
      <select
        value={currentCategory}
        onChange={(e) => updateParam("categoria", e.target.value)}
        className="input-field sm:w-auto"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={currentBrand}
        onChange={(e) => updateParam("marca", e.target.value)}
        className="input-field sm:w-auto"
      >
        <option value="">Todas las marcas</option>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        value={currentTag}
        onChange={(e) => updateParam("tag", e.target.value)}
        className="input-field sm:w-auto"
      >
        <option value="">Todas las etiquetas</option>
        <option value="NUEVO">Nuevo</option>
        <option value="OFERTA">Oferta</option>
        <option value="TOP_VENTAS">Top ventas</option>
      </select>

      <select
        value={currentSort}
        onChange={(e) => updateParam("orden", e.target.value)}
        className="input-field sm:ml-auto sm:w-auto"
      >
        <option value="">Más relevantes</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
        <option value="nombre">Nombre A-Z</option>
      </select>
    </div>
  );
}
