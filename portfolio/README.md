# Portfolio — Emmanuel Bermúdez

Landing de portafolio personal. Next.js 15 + TypeScript + Tailwind CSS + Framer Motion, 100% estático (sin base de datos), pensado para desplegarse en Vercel y cargar instantáneo.

## Stack

- Next.js 15 (App Router), TypeScript estricto
- Tailwind CSS
- Framer Motion — animaciones de scroll (reveals por palabra, paneles de proyecto con scroll-scrubbing, botones magnéticos)
- Fuentes optimizadas con `next/font` (Space Grotesk + Inter, self-hosted, sin requests externos)

## Estructura

```
src/
├── app/            # layout, page, metadata SEO/OG
├── components/      # Nav, Hero, About, Stack, Projects, ProjectCard, Contact, Footer,
│                     RevealText, MagneticButton, ScrollProgress, CursorGlow
└── lib/data.ts       # contenido: proyectos, skills, contacto
```

## Editar contenido

Todo el contenido "de negocio" (proyectos, skills, correo, GitHub) vive en un solo lugar: [`src/lib/data.ts`](src/lib/data.ts). No hace falta tocar componentes para:

- Agregar/quitar un proyecto (incluye `liveUrl` opcional — se muestra el botón "Ver demo" solo si existe)
- Cambiar el correo o el usuario de GitHub
- Reordenar o editar el stack técnico

## Desarrollo local

```bash
npm install
npm run dev
```

## Notas de diseño

- Los títulos usan `RevealText`: animan palabra por palabra con un solo `IntersectionObserver` por bloque de texto (via `variants` + `staggerChildren` de Framer Motion) en vez de uno por palabra — esto último resultó frágil con scrolls rápidos (algunas palabras se quedaban a mitad de la animación).
- El titular del hero anima al montar (`inView={false}` en `RevealText`), no al hacer scroll: es lo primero que ve cualquier visitante, así que no depende de un evento de scroll que dispare el observer.
- Las tarjetas de proyecto (`ProjectCard`) usan un mockup de navegador abstracto (sin capturas de pantalla reales todavía) coloreado con el acento de cada proyecto. Cuando cada proyecto tenga una URL en vivo, vale la pena reemplazarlo por una captura real.
