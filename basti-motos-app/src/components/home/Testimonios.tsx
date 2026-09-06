import { RatingStars } from "@/components/ui/RatingStars";
import { Reveal } from "@/components/ui/Reveal";

const TESTIMONIOS = [
  {
    nombre: "Juan Camilo Restrepo",
    ciudad: "Medellín",
    rating: 5,
    comentario:
      "Pedí el kit de cambio de aceite y llegó súper rápido. Mi moto se siente como nueva, el servicio al cliente también fue excelente.",
  },
  {
    nombre: "Laura Martínez",
    ciudad: "Bogotá",
    rating: 5,
    comentario:
      "El lubricante de cadena Racing X es otro nivel, se nota en el sonido y en la suavidad del cambio. Ya es parte fija de mi mantenimiento.",
  },
  {
    nombre: "Andrés Duque",
    ciudad: "Cali",
    rating: 4,
    comentario:
      "Compré las pastillas de freno cerámicas y el frenado es mucho más preciso. Recomendado para quienes rodamos a diario en la ciudad.",
  },
];

export function Testimonios() {
  return (
    <section className="border-b border-white/10 py-20">
      <div className="container-app">
        <Reveal>
          <span className="section-tag">Comunidad rider</span>
          <h2 className="section-title">Lo que dicen los riders</h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {TESTIMONIOS.map((t) => (
            <Reveal key={t.nombre}>
              <div className="glass-card flex h-full flex-col p-6">
                <RatingStars rating={t.rating} />
                <p className="mt-4 flex-1 text-sm text-neutral-300">&ldquo;{t.comentario}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-racing-orange/15 font-display font-bold text-racing-orange">
                    {t.nombre
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.nombre}</p>
                    <p className="text-xs text-neutral-500">{t.ciudad}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
