"use client";

import { motion, type Variants } from "framer-motion";
import { RevealText } from "@/components/RevealText";
import { SKILLS } from "@/lib/data";

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export function Stack() {
  return (
    <section id="stack" className="relative border-y border-white/[0.06] py-32">
      <div className="container-xl">
        <span className="eyebrow">Stack</span>
        <h2 className="font-display mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          <RevealText text="Herramientas que uso todos los días." />
        </h2>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((group, groupIndex) => (
            <motion.div
              key={group.label}
              variants={groupVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delayChildren: groupIndex * 0.05 }}
            >
              <motion.h3
                variants={headingVariants}
                className="text-sm font-semibold uppercase tracking-widest text-paper-400"
              >
                {group.label}
              </motion.h3>
              <ul className="mt-5 flex flex-col gap-3">
                {group.items.map((item) => (
                  <motion.li key={item} variants={itemVariants} className="font-display text-lg text-paper-50/90">
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
