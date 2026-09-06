"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver that flips `data-reveal="visible"` the
 * first time an element scrolls into view — pure CSS handles the transition
 * (see [data-reveal] in globals.css), so this never touches layout/paint
 * beyond a single class-like attribute swap.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-reveal", "visible");
          observer.disconnect();
        }
      },
      { threshold },
    );

    el.setAttribute("data-reveal", "hidden");
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
