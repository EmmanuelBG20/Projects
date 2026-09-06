import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-racing-red/20 via-carbon-900 to-racing-orange/10 py-20">
      <div className="container-app text-center">
        <Reveal>
          <span className="section-tag">Oferta combo</span>
          <h2 className="font-display text-2xl font-black text-white sm:text-3xl md:text-4xl">
            Arma tu kit y ahorra hasta 20%
          </h2>
          <p className="section-subtitle mx-auto">
            Selecciona los productos que tu moto necesita y recibe descuentos por comprar en combo aplicando un cupón en el checkout.
          </p>
          <Link href="/productos" className="btn-primary">
            Crear mi kit
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
