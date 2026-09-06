"use client";

import { motion, type Variants } from "framer-motion";
import { ShieldCheck, Boxes, Webhook } from "lucide-react";
import { RevealText } from "@/components/RevealText";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "El servidor manda",
    text: "Precios, descuentos y totales se recalculan siempre en el backend. El navegador nunca decide cuánto cuesta algo.",
  },
  {
    icon: Boxes,
    title: "Cero sobreventa",
    text: "El inventario se reserva con actualizaciones condicionales dentro de transacciones, no cruzando los dedos con el nivel de aislamiento de la base de datos.",
  },
  {
    icon: Webhook,
    title: "Webhooks idempotentes",
    text: "Un pago aprobado se procesa una sola vez, así el proveedor reintente el mismo evento diez veces.",
  },
];

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function About() {
  return (
    <section id="sobre-mi" className="relative py-32">
      <div className="container-xl">
        <span className="eyebrow">Sobre mí</span>

        <h2 className="font-display mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          <RevealText text="No entrego demos bonitas: entrego sistemas que sobreviven al primer cliente real." />
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mt-8 max-w-2xl text-lg text-paper-400"
        >
          Me enfoco en e-commerce y productos con dinero real de por medio: pagos,
          inventario, cuentas de usuario. Uso Next.js y PostgreSQL como base, y
          diseño cada flujo crítico —checkout, webhooks, reservas de stock— asumiendo
          que algo va a fallar, para que cuando falle, el sistema lo maneje bien.
        </motion.p>

        <motion.div
          variants={groupVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 grid gap-6 sm:grid-cols-3"
        >
          {PRINCIPLES.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.16]"
            >
              <p.icon size={22} className="text-accent-light" />
              <h3 className="font-display mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-400">{p.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
