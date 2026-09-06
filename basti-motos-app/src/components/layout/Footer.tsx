import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-carbon-950">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-display text-xl font-black text-white">
            BASTI<span className="text-racing-orange"> MOTOS</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-neutral-400">
            Kits, herramientas y productos de mantenimiento para que cada ruta empiece con la moto en su mejor estado.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook" className="rounded-full border border-white/10 p-2 text-neutral-400 hover:border-racing-orange hover:text-racing-orange">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full border border-white/10 p-2 text-neutral-400 hover:border-racing-orange hover:text-racing-orange">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="YouTube" className="rounded-full border border-white/10 p-2 text-neutral-400 hover:border-racing-orange hover:text-racing-orange">
              <Youtube size={16} />
            </a>
          </div>
        </div>

        <div>
          <h5 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">Enlaces rápidos</h5>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="/" className="hover:text-racing-orange">Inicio</Link></li>
            <li><Link href="/productos" className="hover:text-racing-orange">Kits</Link></li>
            <li><Link href="/#taller" className="hover:text-racing-orange">Taller</Link></li>
            <li><Link href="/productos?tag=OFERTA" className="hover:text-racing-orange">Ofertas</Link></li>
            <li><Link href="/contacto" className="hover:text-racing-orange">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">Categorías</h5>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="/categorias/cambio-de-aceite" className="hover:text-racing-orange">Cambio de aceite</Link></li>
            <li><Link href="/categorias/kit-de-arrastre" className="hover:text-racing-orange">Kit de arrastre</Link></li>
            <li><Link href="/categorias/frenos" className="hover:text-racing-orange">Frenos</Link></li>
            <li><Link href="/categorias/limpieza" className="hover:text-racing-orange">Limpieza</Link></li>
            <li><Link href="/categorias/herramientas" className="hover:text-racing-orange">Herramientas</Link></li>
            <li><Link href="/categorias/accesorios-para-rider" className="hover:text-racing-orange">Accesorios para rider</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">Contacto</h5>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li className="flex items-center gap-2"><Mail size={14} /> hola@bastimotos.co</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +57 300 123 4567</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Medellín, Colombia</li>
          </ul>
          <div className="mt-4 flex gap-3 text-xs text-neutral-500">
            <Link href="/terminos" className="hover:text-neutral-300">Términos</Link>
            <Link href="/privacidad" className="hover:text-neutral-300">Privacidad</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} BASTI MOTOS. Todos los derechos reservados.
      </div>
    </footer>
  );
}
