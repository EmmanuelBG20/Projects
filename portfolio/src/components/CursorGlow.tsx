"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Halo suave que sigue al cursor para dar profundidad al fondo (desktop). */
export function CursorGlow() {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.5 });

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      x.set(e.clientX - 300);
      y.set(e.clientY - 300);
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[600px] w-[600px] rounded-full opacity-[0.15] blur-3xl md:block"
      style={{
        x: springX,
        y: springY,
        background: "radial-gradient(circle, #7c5cff 0%, transparent 70%)",
      }}
    />
  );
}
