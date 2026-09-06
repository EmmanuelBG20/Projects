"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export interface FilterOptions {
  sizes: string[];
  colors: { name: string; hex: string }[];
  minPrice: number;
  maxPrice: number;
}

export function FiltersSidebar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedSizes = searchParams.getAll("size");
  const selectedColors = searchParams.getAll("color");
  const inStock = searchParams.get("inStock") === "true";

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || options.minPrice,
    Number(searchParams.get("maxPrice")) || options.maxPrice,
  ]);

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      mutate(params);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function toggleValue(key: "size" | "color", value: string) {
    pushParams((params) => {
      const current = params.getAll(key);
      params.delete(key);
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      for (const v of next) params.append(key, v);
    });
  }

  function toggleInStock() {
    pushParams((params) => {
      if (params.get("inStock") === "true") params.delete("inStock");
      else params.set("inStock", "true");
    });
  }

  function commitPrice(values: number[]) {
    pushParams((params) => {
      params.set("minPrice", String(values[0]));
      params.set("maxPrice", String(values[1]));
    });
  }

  return (
    <div className="space-y-8">
      {options.sizes.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest">Talla</p>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleValue("size", size)}
                  className={`h-9 min-w-9 border px-2.5 text-xs transition-colors ${
                    active ? "border-foreground bg-foreground text-background" : "border-input hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {options.colors.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest">Color</p>
          <div className="flex flex-wrap gap-2.5">
            {options.colors.map((color) => {
              const active = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  title={color.name}
                  onClick={() => toggleValue("color", color.name)}
                  className={`h-7 w-7 rounded-full border transition-all ${
                    active ? "ring-2 ring-foreground ring-offset-2" : "border-border"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-widest">Precio</p>
        <Slider
          min={options.minPrice}
          max={options.maxPrice}
          step={5000}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          onValueCommit={commitPrice}
        />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <Checkbox checked={inStock} onCheckedChange={() => toggleInStock()} />
        Solo disponibles
      </label>
    </div>
  );
}
