"use client";

import { motion, type Variants } from "framer-motion";
import { Github, Mail } from "lucide-react";
import { RevealText } from "@/components/RevealText";
import { Magnetic } from "@/components/MagneticButton";
import { CONTACT } from "@/lib/data";

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Contact() {
  return (
    <section id="contacto" className="relative overflow-hidden py-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-fade" />

      <motion.div
        variants={groupVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="container-xl relative flex flex-col items-center text-center"
      >
        <span className="eyebrow">Contacto</span>

        <h2 className="font-display mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          <RevealText text="¿Tienes un proyecto real" />
          <br />
          <RevealText text="que resolver?" delay={0.15} className="text-accent-light" />
        </h2>

        <motion.p variants={fadeUp} className="mt-6 max-w-md text-paper-400">
          Escríbeme directamente, sin formularios ni intermediarios.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <a href={`mailto:${CONTACT.email}`} className="btn-solid">
              <Mail size={16} /> {CONTACT.email}
            </a>
          </Magnetic>
          <Magnetic>
            <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <Github size={16} /> {CONTACT.githubHandle}
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>
    </section>
  );
}
