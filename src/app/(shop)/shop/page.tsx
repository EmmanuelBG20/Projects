import type { Metadata } from "next";
import { ShopContent, type ShopSearchParams } from "@/app/(shop)/shop/shop-content";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explora todas las camisetas, hoodies, pantalones, chaquetas y accesorios de NOVAWEAR.",
};

export default function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  return <ShopContent searchParams={searchParams} />;
}
