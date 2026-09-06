export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  repoUrl: string;
  liveUrl?: string;
  accent: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "basti-motos",
    name: "BASTI MOTOS",
    tagline: "E-commerce de repuestos para motocicletas",
    description:
      "Tienda completa para venta de kits y repuestos de mantenimiento de motos en Colombia: catálogo, cuentas, carrito persistente y checkout con pago real vía Wompi.",
    highlights: [
      "Pago real con Wompi Colombia: firma de integridad y webhook verificado",
      "El stock nunca se descuenta dos veces — idempotencia garantizada a nivel de base de datos",
      "Panel administrativo completo: productos, pedidos, cupones e inventario",
    ],
    stack: ["Next.js 15", "TypeScript", "PostgreSQL", "Prisma", "Auth.js", "Wompi"],
    repoUrl: "https://github.com/EmmanuelBG20/Projects/tree/main/basti-motos-app",
    accent: "#ff6a1a",
  },
  {
    slug: "novawear",
    name: "NovaWear",
    tagline: "E-commerce de moda con IA y multi-pasarela",
    description:
      "Tienda de ropa con arquitectura de nivel comercial: inventario transaccional sin sobreventa, tres pasarelas de pago y un agente de WhatsApp con herramientas controladas.",
    highlights: [
      "Reservas de stock con UPDATE condicional — probado contra dos checkouts compitiendo por la última unidad",
      "Wompi, Mercado Pago y Stripe con degradación automática a sandbox",
      "Suite de pruebas real: Vitest para lógica de negocio, Playwright para flujos completos",
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "Auth.js", "TanStack Query", "Playwright"],
    repoUrl: "https://github.com/EmmanuelBG20/Projects/tree/main/novawear",
    accent: "#22d3ee",
  },
];

export type SkillGroup = {
  label: string;
  items: string[];
};

export const SKILLS: SkillGroup[] = [
  { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { label: "Backend", items: ["Server Actions", "Route Handlers", "Auth.js", "Zod"] },
  { label: "Datos", items: ["PostgreSQL", "Prisma ORM", "Migraciones", "Modelado transaccional"] },
  { label: "Pagos e integraciones", items: ["Wompi", "Stripe", "Mercado Pago", "Resend", "Cloudinary"] },
];

export const CONTACT = {
  email: "emmanuelbermu9@gmail.com",
  github: "https://github.com/EmmanuelBG20",
  githubHandle: "@EmmanuelBG20",
};
