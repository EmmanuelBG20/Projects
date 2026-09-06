"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CONTACT } from "@/lib/data";

const LINKS = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#stack", label: "Stack" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#contacto", label: "Contacto" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > 120 && latest > previous);
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl" : ""
      }`}
    >
      <nav className="container-xl flex h-20 items-center justify-between">
        <a href="#inicio" className="font-display text-lg font-semibold tracking-tight">
          EB<span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-paper-400 transition-colors hover:text-paper-50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${CONTACT.email}`}
          className="hidden rounded-full border border-white/15 px-5 py-2 text-sm font-medium transition-colors hover:border-white/40 sm:inline-flex"
        >
          Hablemos
        </a>
      </nav>
    </motion.header>
  );
}
