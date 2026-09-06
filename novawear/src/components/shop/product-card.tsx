import Link from "next/link";
import Image from "next/image";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";

export interface ProductCardData {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  isNew: boolean;
  image: string | null;
  imageAlt?: string | null;
  secondaryImage?: string | null;
  colorCount?: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {product.image && (
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
        )}
        {product.secondaryImage && (
          <Image
            src={product.secondaryImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-0 transition-opacity duration-500 ease-editorial group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge>Nuevo</Badge>}
          {product.compareAtPrice && <Badge variant="rust">Oferta</Badge>}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium leading-tight">{product.name}</h3>
        <div className="flex items-center justify-between">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          {!!product.colorCount && product.colorCount > 1 && (
            <span className="text-xs text-muted-foreground">{product.colorCount} colores</span>
          )}
        </div>
      </div>
    </Link>
  );
}
