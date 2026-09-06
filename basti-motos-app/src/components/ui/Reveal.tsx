"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Envuelve contenido y le agrega la animación fade-in-up al entrar en pantalla. */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // @ts-expect-error -- ref se asigna dinámicamente según el tag elegido
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
