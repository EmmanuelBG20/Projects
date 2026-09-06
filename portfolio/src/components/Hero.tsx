"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { RevealText } from "@/components/RevealText";
import { Magnetic } from "@/components/MagneticButton";
import { CONTACT } from "@/lib/data";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative flex h-[100svh] min-h-[640px] flex-col items-center justify-center overflow-hidden"
    >
      {/* Blobs de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[-10%] h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-30 blur-[110px]"
          style={{ background: "radial-gradient(circle, #7c5cff 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-15%] right-[-5%] h-[420px] w-[420px] rounded-full opacity-20 blur-[110px]"
          style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <motion.div style={{ opacity, scale, y }} className="container-xl relative flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="eyebrow mb-6"
        >
          Desarrollador Full Stack · Colombia
        </motion.span>

        <h1 className="font-display max-w-4xl text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <RevealText text="Construyo software" inView={false} />
          <br />
          <RevealText text="que la gente" delay={0.15} inView={false} />{" "}
          <RevealText text="realmente usa." delay={0.3} inView={false} className="text-accent-light" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-7 max-w-xl text-balance text-lg text-paper-400"
        >
          E-commerce con pagos reales, inventario que no se sobrevende y paneles
          administrativos que un equipo de verdad puede operar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <a href="#proyectos" className="btn-solid">
              Ver proyectos
            </a>
          </Magnetic>
          <Magnetic>
            <a href={`mailto:${CONTACT.email}`} className="btn-outline">
              Hablemos
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-paper-400"
      >
        <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
