"use client";

import { motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const wordVariants: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
};

/**
 * Anima cada palabra de un texto con un stagger, usando UN solo observer de
 * scroll en el contenedor (variants + staggerChildren) en vez de uno por
 * palabra — un observer por palabra resultó frágil: con scrolls rápidos
 * sucesivos, algunas palabras se quedaban congeladas a mitad de la
 * transición en vez de completarla.
 *
 * `inView=true` (default) dispara la animación al hacer scroll hasta el
 * texto — úsalo para todo lo que esté debajo del pliegue. Para texto que ya
 * es visible en la primera pintura (el titular del hero), pasa
 * `inView={false}`: ahí no hay scroll que dispare el observer, así que se
 * anima directo al montar.
 */
export function RevealText({
  text,
  className = "",
  delay = 0,
  as: Tag = "span",
  inView = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  inView?: boolean;
}) {
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045, delayChildren: delay } },
  };

  const triggerProps = inView
    ? { whileInView: "show" as const, viewport: { once: true, amount: 0.4 } }
    : { animate: "show" as const };

  return (
    <Tag className={className} style={{ display: "inline" }}>
      <motion.span
        style={{ display: "inline" }}
        variants={containerVariants}
        initial="hidden"
        {...triggerProps}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-1 pr-[0.25em] align-bottom">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
