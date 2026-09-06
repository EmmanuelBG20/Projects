"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { Magnetic } from "@/components/MagneticButton";
import type { Project } from "@/lib/data";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.1"] });

  const visualScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const visualRotate = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -3]);
  const visualY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.4, 0.15]);

  const reversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16 ${
        reversed ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Visual */}
      <motion.div style={{ scale: visualScale, rotate: visualRotate, y: visualY }} className="relative">
        <motion.div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-full blur-3xl"
          style={{ opacity: glow, background: `radial-gradient(circle, ${project.accent} 0%, transparent 70%)` }}
        />
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-ink-700/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          {project.screenshot ? (
            <div className="relative aspect-[16/11]">
              <Image
                src={project.screenshot}
                alt={`Captura de ${project.name}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover object-top"
                priority={index === 0}
              />
            </div>
          ) : (
            <div
              className="flex aspect-[16/11] flex-col justify-between p-6"
              style={{ background: `linear-gradient(155deg, ${project.accent}22, transparent 60%)` }}
            >
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-md bg-white/10" />
                <div className="h-6 w-6 rounded-md bg-white/10" />
                <div className="h-6 w-6 rounded-md bg-white/10" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-square rounded-lg border border-white/10 bg-white/[0.04]" />
                ))}
              </div>
              <div className="h-9 w-32 rounded-full" style={{ background: project.accent }} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Contenido */}
      <div>
        <span className="eyebrow" style={{ color: project.accent }}>
          {project.tagline}
        </span>
        <h3 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {project.name}
        </h3>
        <p className="mt-4 text-paper-400">{project.description}</p>

        <ul className="mt-6 flex flex-col gap-3">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-sm text-paper-200">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: project.accent }} />
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper-400"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Magnetic>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Github size={16} /> Ver código
            </a>
          </Magnetic>
          {project.liveUrl && (
            <Magnetic>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-solid">
                Ver demo <ArrowUpRight size={16} />
              </a>
            </Magnetic>
          )}
        </div>
      </div>
    </div>
  );
}
