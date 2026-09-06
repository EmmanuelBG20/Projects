"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Droplet, Link2, Disc, AlertTriangle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const GAUGES = [
  { key: "aceite", label: "Próximo cambio de aceite", icon: Droplet, target: 80 },
  { key: "cadena", label: "Estado de la cadena", icon: Link2, target: 55 },
  { key: "frenos", label: "Estado de frenos", icon: Disc, target: 70 },
] as const;

function Gauge({ label, Icon, target }: { label: string; Icon: typeof Droplet; target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1000;
          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.round(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="glass-card flex flex-col items-center p-6 text-center">
      <div
        className="relative flex h-36 w-36 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#ff6a1a ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-carbon-800">
          <span className="font-display text-2xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <h4 className="mt-4 flex items-center gap-2 font-semibold text-white">
        <Icon size={16} className="text-racing-orange" /> {label}
      </h4>
    </div>
  );
}

export function EstadoMoto() {
  return (
    <section className="border-b border-white/10 bg-carbon-800/40 py-20">
      <div className="container-app">
        <Reveal>
          <span className="section-tag">Panel del rider</span>
          <h2 className="section-title">Revisa el estado de tu moto</h2>
          <p className="section-subtitle">Un vistazo rápido a lo que tu moto necesita ahora mismo (ejemplo ilustrativo).</p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {GAUGES.map((g) => (
            <Reveal key={g.key}>
              <Gauge label={g.label} Icon={g.icon} target={g.target} />
            </Reveal>
          ))}
        </div>

        <Reveal className="glass-card mt-8 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
          <AlertTriangle size={22} className="shrink-0 text-racing-orange" />
          <p className="flex-1 text-sm text-neutral-200">
            Tu cadena podría necesitar lubricación pronto. Recomendamos aplicar lubricante cada 500 km.
          </p>
          <Link href="/categorias/kit-de-arrastre" className="btn-secondary shrink-0">
            Ver lubricantes
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
