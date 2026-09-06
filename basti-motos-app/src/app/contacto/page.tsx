"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Este formulario es informativo: no hay un backend de tickets de soporte
    // en el alcance del proyecto, así que confirmamos la recepción localmente.
    setTimeout(() => {
      setLoading(false);
      push("¡Gracias! Recibimos tu mensaje y te responderemos pronto.", "success");
      e.currentTarget.reset();
    }, 600);
  }

  return (
    <div className="container-app py-16">
      <div className="mb-10 text-center">
        <span className="section-tag">Hablemos</span>
        <h1 className="section-title">Contáctanos</h1>
        <p className="section-subtitle mx-auto mb-0">
          ¿Dudas sobre un pedido o qué kit necesita tu moto? Escríbenos.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
          <div>
            <label className="label-field">Nombre</label>
            <input required className="input-field" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="label-field">Correo</label>
            <input required type="email" className="input-field" placeholder="tucorreo@ejemplo.com" />
          </div>
          <div>
            <label className="label-field">Mensaje</label>
            <textarea required rows={4} className="input-field" placeholder="Cuéntanos en qué te ayudamos" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <Send size={16} /> {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>

        <div className="glass-card space-y-5 p-6">
          <div className="flex items-start gap-3">
            <Mail size={20} className="mt-0.5 text-racing-orange" />
            <div>
              <p className="font-semibold text-white">Correo</p>
              <p className="text-sm text-neutral-400">hola@bastimotos.co</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={20} className="mt-0.5 text-racing-orange" />
            <div>
              <p className="font-semibold text-white">Teléfono</p>
              <p className="text-sm text-neutral-400">+57 300 123 4567</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="mt-0.5 text-racing-orange" />
            <div>
              <p className="font-semibold text-white">Ubicación</p>
              <p className="text-sm text-neutral-400">Medellín, Colombia — envíos a todo el país</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
