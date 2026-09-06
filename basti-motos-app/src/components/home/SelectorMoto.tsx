"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Gauge, Wrench, Search } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const MARCAS = ["Yamaha", "Honda", "Bajaj", "Suzuki", "KTM", "TVS"];
const CILINDRAJES = ["125cc", "150cc", "200cc", "250cc", "400cc", "650cc+"];
const SERVICIOS: { value: string; label: string; categorySlug: string }[] = [
  { value: "aceite", label: "Cambio de aceite", categorySlug: "cambio-de-aceite" },
  { value: "arrastre", label: "Kit de arrastre", categorySlug: "kit-de-arrastre" },
  { value: "frenos", label: "Frenos", categorySlug: "frenos" },
  { value: "limpieza", label: "Limpieza", categorySlug: "limpieza" },
  { value: "revision", label: "Revisión general", categorySlug: "" },
];

export function SelectorMoto() {
  const [marca, setMarca] = useState("");
  const [cilindraje, setCilindraje] = useState("");
  const [servicio, setServicio] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!marca || !cilindraje || !servicio) {
      setResult("Selecciona marca, cilindraje y tipo de servicio para continuar.");
      return;
    }

    const servicioInfo = SERVICIOS.find((s) => s.value === servicio)!;
    setResult(
      `Encontramos kits compatibles con tu ${marca} ${cilindraje} para "${servicioInfo.label}". Te llevamos al catálogo filtrado...`
    );

    setTimeout(() => {
      const params = new URLSearchParams();
      if (servicioInfo.categorySlug) params.set("categoria", servicioInfo.categorySlug);
      router.push(`/productos?${params.toString()}`);
    }, 900);
  }

  return (
    <section id="taller" className="border-b border-white/10 bg-carbon-800/40 py-20">
      <div className="container-app">
        <Reveal>
          <span className="section-tag">Taller virtual</span>
          <h2 className="section-title">Encuentra el kit ideal para tu moto</h2>
          <p className="section-subtitle">Selecciona los datos de tu motocicleta y te mostramos los kits compatibles.</p>
        </Reveal>

        <Reveal>
          <form onSubmit={handleSubmit} className="glass-card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="label-field flex items-center gap-2"><Bike size={16} /> Marca</span>
              <select value={marca} onChange={(e) => setMarca(e.target.value)} className="input-field">
                <option value="">Selecciona</option>
                {MARCAS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="label-field flex items-center gap-2"><Gauge size={16} /> Cilindraje</span>
              <select value={cilindraje} onChange={(e) => setCilindraje(e.target.value)} className="input-field">
                <option value="">Selecciona</option>
                {CILINDRAJES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="label-field flex items-center gap-2"><Wrench size={16} /> Servicio</span>
              <select value={servicio} onChange={(e) => setServicio(e.target.value)} className="input-field">
                <option value="">Selecciona</option>
                {SERVICIOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            <button type="submit" className="btn-primary self-end">
              <Search size={18} /> Encontrar mi kit
            </button>
          </form>

          {result && (
            <p className="glass-card mt-4 p-4 text-sm text-neutral-200 animate-[fade-in-up_0.4s_ease-out]">
              {result}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
