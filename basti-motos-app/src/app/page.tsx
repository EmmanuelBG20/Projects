import { Hero } from "@/components/home/Hero";
import { SelectorMoto } from "@/components/home/SelectorMoto";
import { Categorias } from "@/components/home/Categorias";
import { ProductosDestacados } from "@/components/home/ProductosDestacados";
import { EstadoMoto } from "@/components/home/EstadoMoto";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonios } from "@/components/home/Testimonios";

// El catálogo (categorías, destacados) cambia constantemente desde el panel
// admin: se renderiza en cada request en vez de generarse una sola vez en
// build time, para no mostrar stock/precios desactualizados.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectorMoto />
      <Categorias />
      <ProductosDestacados />
      <EstadoMoto />
      <PromoBanner />
      <Testimonios />
    </>
  );
}
