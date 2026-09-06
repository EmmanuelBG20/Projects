"use client";

import { RevealText } from "@/components/RevealText";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/lib/data";

export function Projects() {
  return (
    <section id="proyectos" className="relative py-32">
      <div className="container-xl">
        <span className="eyebrow">Proyectos</span>
        <h2 className="font-display mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          <RevealText text="Cosas que construí de punta a punta." />
        </h2>

        <div className="mt-8 divide-y divide-white/[0.06]">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
