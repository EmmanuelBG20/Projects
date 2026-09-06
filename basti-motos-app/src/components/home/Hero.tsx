import Link from "next/link";
import { Truck, Star, Lock } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { FallbackImage } from "@/components/ui/FallbackImage";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0">
        <FallbackImage
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80"
          alt="Motocicleta de alto rendimiento"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon-900 via-carbon-900/90 to-carbon-900/40" />
      </div>

      <div className="container-app relative py-24 sm:py-32">
        <Reveal>
          <span className="section-tag">Mantenimiento inteligente para tu moto</span>
          <h1 className="font-display max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            Tu moto no necesita suerte.
            <br />
            <span className="text-racing-orange">Necesita mantenimiento.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-300">
            Kits seleccionados para que mantengas el rendimiento, la seguridad y el estilo de tu motocicleta.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/productos" className="btn-primary">
              Explorar kits
            </Link>
            <Link href="#categorias" className="btn-ghost">
              Ver categorías
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-14 grid max-w-2xl gap-4 sm:grid-cols-3">
          <div className="glass-card flex items-start gap-3 p-4">
            <Truck size={22} className="mt-0.5 shrink-0 text-racing-orange" />
            <div>
              <p className="text-sm font-semibold text-white">Envío gratis</p>
              <p className="text-xs text-neutral-400">Desde $200.000 COP</p>
            </div>
          </div>
          <div className="glass-card flex items-start gap-3 p-4">
            <Star size={22} className="mt-0.5 shrink-0 text-racing-orange" />
            <div>
              <p className="text-sm font-semibold text-white">Selección rider</p>
              <p className="text-xs text-neutral-400">Productos probados en ruta</p>
            </div>
          </div>
          <div className="glass-card flex items-start gap-3 p-4">
            <Lock size={22} className="mt-0.5 shrink-0 text-racing-orange" />
            <div>
              <p className="text-sm font-semibold text-white">Pago seguro</p>
              <p className="text-xs text-neutral-400">Procesado con Wompi</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
