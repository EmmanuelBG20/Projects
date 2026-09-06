import { PrismaClient, type ProductTag } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_SHIPPING_RATES } from "../src/lib/shipping";

const prisma = new PrismaClient();

const IMG = {
  motoDark: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  motoRoad: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80",
  toolsFlat: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
  garage: "https://images.unsplash.com/photo-1767480350909-b58b3216cc78?auto=format&fit=crop&w=900&q=80",
  motoStudio: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80",
  helmet: "https://images.unsplash.com/photo-1590506995460-d0d9892b54da?auto=format&fit=crop&w=900&q=80",
  engine: "https://images.unsplash.com/photo-1580310614729-ccd69652491d?auto=format&fit=crop&w=900&q=80",
  wheel: "https://images.unsplash.com/photo-1657873961503-89a65459de2b?auto=format&fit=crop&w=900&q=80",
};

const CATEGORIES = [
  { name: "Cambio de aceite", slug: "cambio-de-aceite", icon: "oil-can", description: "Kits completos con aceite y filtro para cada cilindraje." },
  { name: "Kit de arrastre", slug: "kit-de-arrastre", icon: "link", description: "Cadena, piñón y catalina para máxima transmisión de potencia." },
  { name: "Frenos", slug: "frenos", icon: "disc", description: "Pastillas y discos para frenar con total seguridad." },
  { name: "Limpieza", slug: "limpieza", icon: "spray-can", description: "Productos para que tu moto luzca como el primer día." },
  { name: "Herramientas", slug: "herramientas", icon: "wrench", description: "Equipo profesional de taller para mantenimiento en casa." },
  { name: "Accesorios para rider", slug: "accesorios-para-rider", icon: "helmet", description: "Guantes, chaquetas y gear pensados para rodar seguro." },
  { name: "Cascos y protección", slug: "cascos-y-proteccion", icon: "helmet", description: "Cascos y protecciones certificadas para cada tipo de ruta." },
  { name: "Eléctricos y repuestos", slug: "electricos-y-repuestos", icon: "bolt", description: "Bujías, cables y repuestos eléctricos esenciales." },
];

const BRANDS = [
  { name: "BASTI MOTOS", slug: "basti-motos" },
  { name: "Motul", slug: "motul" },
  { name: "Racing X", slug: "racing-x" },
  { name: "Ceramic Pro", slug: "ceramic-pro" },
  { name: "Rider Pro", slug: "rider-pro" },
  { name: "Black Rider", slug: "black-rider" },
  { name: "Iridium Performance", slug: "iridium-performance" },
];

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  brandSlug: string;
  priceCents: number;
  compareAtPriceCents?: number;
  stock: number;
  tags: ProductTag[];
  rating: number;
  reviewCount: number;
  images: string[];
  relatedSlugs?: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Kit cambio de aceite 10W-40 Premium",
    slug: "kit-cambio-de-aceite-10w-40-premium",
    sku: "BM-ACE-001",
    shortDescription: "Aceite semisintético 10W-40 + filtro incluido, listo para instalar.",
    description:
      "Kit completo para el cambio de aceite de tu motocicleta: 1 litro de aceite semisintético 10W-40 de alto rendimiento más filtro de aceite compatible. Protege el motor en ciudad y carretera, reduce la fricción interna y ayuda a mantener la temperatura de operación estable.",
    categorySlug: "cambio-de-aceite",
    brandSlug: "basti-motos",
    priceCents: 89_900 * 100,
    compareAtPriceCents: 109_900 * 100,
    stock: 40,
    tags: ["TOP_VENTAS"],
    rating: 4.7,
    reviewCount: 34,
    images: [IMG.engine, IMG.garage],
    relatedSlugs: ["aceite-sintetico-4t-20w-50"],
  },
  {
    name: "Aceite sintético 4T 20W-50",
    slug: "aceite-sintetico-4t-20w-50",
    sku: "MOT-ACE-002",
    shortDescription: "Aceite 100% sintético para motores 4 tiempos de alto desempeño.",
    description:
      "Formulado para motores 4 tiempos exigidos, este aceite 100% sintético 20W-50 ofrece protección superior contra el desgaste, mayor estabilidad térmica y una vida útil más larga entre cambios.",
    categorySlug: "cambio-de-aceite",
    brandSlug: "motul",
    priceCents: 64_900 * 100,
    stock: 60,
    tags: [],
    rating: 4.6,
    reviewCount: 19,
    images: [IMG.engine],
  },
  {
    name: "Lubricante de cadena Racing X",
    slug: "lubricante-de-cadena-racing-x",
    sku: "RX-ARR-001",
    shortDescription: "Lubricante de alta adherencia para cadena, resistente al agua.",
    description:
      "Fórmula de alta adherencia que se mantiene en la cadena incluso a altas velocidades y bajo lluvia. Reduce el ruido, previene el óxido y prolonga la vida útil del kit de arrastre. Se recomienda aplicar cada 500 km.",
    categorySlug: "kit-de-arrastre",
    brandSlug: "racing-x",
    priceCents: 34_900 * 100,
    stock: 80,
    tags: ["NUEVO"],
    rating: 4.8,
    reviewCount: 41,
    images: [IMG.wheel],
  },
  {
    name: "Kit de arrastre completo (cadena, piñón y catalina)",
    slug: "kit-de-arrastre-completo",
    sku: "BM-ARR-002",
    shortDescription: "Cadena reforzada, piñón y catalina en un solo kit.",
    description:
      "Reemplaza tu sistema de transmisión completo con este kit de arrastre reforzado, diseñado para uso urbano y de carretera. Incluye cadena, piñón delantero y catalina trasera con acabado anticorrosivo.",
    categorySlug: "kit-de-arrastre",
    brandSlug: "basti-motos",
    priceCents: 189_900 * 100,
    compareAtPriceCents: 219_900 * 100,
    stock: 15,
    tags: ["OFERTA"],
    rating: 4.5,
    reviewCount: 12,
    images: [IMG.wheel, IMG.garage],
  },
  {
    name: "Pastillas de freno delanteras Ceramic Pro",
    slug: "pastillas-de-freno-delanteras-ceramic-pro",
    sku: "CP-FRE-001",
    shortDescription: "Pastillas cerámicas de frenado preciso y bajo desgaste de disco.",
    description:
      "Compuesto cerámico de alto rendimiento que ofrece frenado consistente en frío y en caliente, menor generación de polvo y menor desgaste del disco. Ideal para uso urbano intenso.",
    categorySlug: "frenos",
    brandSlug: "ceramic-pro",
    priceCents: 74_900 * 100,
    stock: 35,
    tags: ["TOP_VENTAS"],
    rating: 4.7,
    reviewCount: 28,
    images: [IMG.garage],
  },
  {
    name: "Disco de freno flotante 260mm",
    slug: "disco-de-freno-flotante-260mm",
    sku: "BM-FRE-002",
    shortDescription: "Disco flotante de acero inoxidable, mejor disipación de calor.",
    description:
      "Disco de freno flotante de 260mm fabricado en acero inoxidable, con diseño perforado para mejorar la disipación de calor y el frenado en condiciones húmedas.",
    categorySlug: "frenos",
    brandSlug: "basti-motos",
    priceCents: 159_900 * 100,
    stock: 12,
    tags: [],
    rating: 4.4,
    reviewCount: 9,
    images: [IMG.garage],
  },
  {
    name: "Kit de limpieza total para motocicleta",
    slug: "kit-de-limpieza-total-para-motocicleta",
    sku: "BM-LIM-001",
    shortDescription: "Shampoo, desengrasante y microfibra para dejar tu moto como nueva.",
    description:
      "Kit completo de limpieza: shampoo especializado para carrocería, desengrasante para cadena y motor, y paño de microfibra. Fórmulas seguras para pintura, plásticos y partes cromadas.",
    categorySlug: "limpieza",
    brandSlug: "basti-motos",
    priceCents: 54_900 * 100,
    stock: 50,
    tags: ["NUEVO"],
    rating: 4.6,
    reviewCount: 22,
    images: [IMG.motoRoad],
  },
  {
    name: "Cera protectora para pintura",
    slug: "cera-protectora-para-pintura",
    sku: "RP-LIM-002",
    shortDescription: "Cera de larga duración con acabado brillante y protección UV.",
    description:
      "Protege la pintura de tu moto contra rayos UV, lluvia ácida y suciedad. Su fórmula de fácil aplicación deja un brillo profundo que dura semanas.",
    categorySlug: "limpieza",
    brandSlug: "rider-pro",
    priceCents: 39_900 * 100,
    stock: 45,
    tags: [],
    rating: 4.3,
    reviewCount: 14,
    images: [IMG.motoStudio],
  },
  {
    name: "Kit de herramientas compacto",
    slug: "kit-de-herramientas-compacto",
    sku: "BM-HER-001",
    shortDescription: "Set de herramientas esenciales para mantenimiento básico en ruta.",
    description:
      "Set compacto con llaves allen, destornilladores intercambiables, llaves mixtas y estuche resistente. Perfecto para llevar en el baúl y resolver imprevistos en cualquier ruta.",
    categorySlug: "herramientas",
    brandSlug: "basti-motos",
    priceCents: 129_900 * 100,
    stock: 20,
    tags: ["TOP_VENTAS"],
    rating: 4.5,
    reviewCount: 17,
    images: [IMG.toolsFlat],
  },
  {
    name: "Torquímetro digital para moto",
    slug: "torquimetro-digital-para-moto",
    sku: "BM-HER-002",
    shortDescription: "Torquímetro digital de precisión para ajustes seguros.",
    description:
      "Herramienta de precisión indispensable para apretar tornillería crítica (frenos, suspensión, motor) al torque exacto recomendado por el fabricante, evitando daños por sobreapriete.",
    categorySlug: "herramientas",
    brandSlug: "basti-motos",
    priceCents: 249_900 * 100,
    compareAtPriceCents: 289_900 * 100,
    stock: 8,
    tags: ["OFERTA"],
    rating: 4.8,
    reviewCount: 6,
    images: [IMG.toolsFlat, IMG.garage],
  },
  {
    name: "Guantes urbanos Black Rider",
    slug: "guantes-urbanos-black-rider",
    sku: "BR-ACC-001",
    shortDescription: "Guantes reforzados con protección en nudillos, uso urbano.",
    description:
      "Guantes de cuero sintético con protección reforzada en los nudillos y palma antideslizante. Diseñados para el uso diario en ciudad, con buena ventilación y ajuste ergonómico.",
    categorySlug: "accesorios-para-rider",
    brandSlug: "black-rider",
    priceCents: 79_900 * 100,
    stock: 30,
    tags: ["NUEVO"],
    rating: 4.5,
    reviewCount: 25,
    images: [IMG.helmet],
  },
  {
    name: "Chaqueta impermeable Rider Pro",
    slug: "chaqueta-impermeable-rider-pro",
    sku: "RP-ACC-002",
    shortDescription: "Chaqueta con membrana impermeable y protecciones removibles.",
    description:
      "Chaqueta técnica con membrana impermeable, protecciones removibles en hombros y codos, y bolsillos para carga. Ideal para rodar todo el año sin depender del clima.",
    categorySlug: "accesorios-para-rider",
    brandSlug: "rider-pro",
    priceCents: 219_900 * 100,
    stock: 18,
    tags: [],
    rating: 4.4,
    reviewCount: 11,
    images: [IMG.motoRoad],
    relatedSlugs: ["guantes-urbanos-black-rider", "casco-urbano-rider-pro"],
  },
  {
    name: "Casco urbano Rider Pro",
    slug: "casco-urbano-rider-pro",
    sku: "RP-CAS-001",
    shortDescription: "Casco certificado, ligero y con visor antirrayado.",
    description:
      "Casco integral certificado, construido en fibra de alta densidad para reducir el peso sin sacrificar seguridad. Incluye visor antirrayado y forro interno removible y lavable.",
    categorySlug: "cascos-y-proteccion",
    brandSlug: "rider-pro",
    priceCents: 349_900 * 100,
    compareAtPriceCents: 399_900 * 100,
    stock: 10,
    tags: ["OFERTA", "TOP_VENTAS"],
    rating: 4.9,
    reviewCount: 52,
    images: [IMG.helmet, IMG.motoStudio],
    relatedSlugs: ["guantes-urbanos-black-rider"],
  },
  {
    name: "Rodilleras de protección",
    slug: "rodilleras-de-proteccion",
    sku: "BR-CAS-002",
    shortDescription: "Rodilleras con placas rígidas y ajuste elástico.",
    description:
      "Protección articulada con placas rígidas externas y acolchado interno, ajuste elástico ajustable para uso urbano y de ruta larga.",
    categorySlug: "cascos-y-proteccion",
    brandSlug: "black-rider",
    priceCents: 99_900 * 100,
    stock: 25,
    tags: [],
    rating: 4.2,
    reviewCount: 8,
    images: [IMG.motoStudio],
  },
  {
    name: "Juego de bujías Iridium Performance",
    slug: "juego-de-bujias-iridium-performance",
    sku: "IP-ELE-001",
    shortDescription: "Bujías de iridio para mejor encendido y ahorro de combustible.",
    description:
      "Electrodo de iridio de baja resistencia para un encendido más eficiente, mejor respuesta del motor y ahorro de combustible. Mayor vida útil que las bujías convencionales.",
    categorySlug: "electricos-y-repuestos",
    brandSlug: "iridium-performance",
    priceCents: 94_900 * 100,
    stock: 40,
    tags: ["TOP_VENTAS"],
    rating: 4.7,
    reviewCount: 30,
    images: [IMG.engine],
    relatedSlugs: ["kit-cambio-de-aceite-10w-40-premium"],
  },
  {
    name: "Cable de clutch reforzado",
    slug: "cable-de-clutch-reforzado",
    sku: "BM-ELE-002",
    shortDescription: "Cable de clutch de acero trenzado con funda reforzada.",
    description:
      "Cable de embrague fabricado en acero trenzado con funda reforzada, resistente a la corrosión. Instalación directa en la mayoría de modelos urbanos.",
    categorySlug: "electricos-y-repuestos",
    brandSlug: "basti-motos",
    priceCents: 44_900 * 100,
    stock: 33,
    tags: [],
    rating: 4.3,
    reviewCount: 7,
    images: [IMG.engine, IMG.toolsFlat],
  },
];

async function main() {
  console.log("Sembrando categorías...");
  for (const category of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }

  console.log("Sembrando marcas...");
  for (const brand of BRANDS) {
    await prisma.brand.upsert({ where: { slug: brand.slug }, update: brand, create: brand });
  }

  console.log("Sembrando tarifas de envío...");
  for (const rate of SEED_SHIPPING_RATES) {
    await prisma.shippingRate.upsert({
      where: { city: rate.city },
      update: { priceCents: rate.priceCents },
      create: rate,
    });
  }

  console.log("Sembrando usuarios de prueba...");
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const customerPasswordHash = await bcrypt.hash("Cliente123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@bastimotos.co" },
    update: {},
    create: {
      name: "Admin BASTI MOTOS",
      email: "admin@bastimotos.co",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "cliente@bastimotos.co" },
    update: {},
    create: {
      name: "Cliente Demo",
      email: "cliente@bastimotos.co",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      emailVerifiedAt: new Date(),
    },
  });

  const existingAddress = await prisma.address.findFirst({ where: { userId: customer.id } });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        fullName: "Cliente Demo",
        phone: "3001234567",
        line1: "Calle 45 # 20-30",
        line2: "Apto 502",
        city: "Medellín",
        department: "Antioquia",
        isDefault: true,
      },
    });
  }

  console.log("Sembrando productos...");
  for (const product of PRODUCTS) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } });
    const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: product.brandSlug } });

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents ?? null,
        stock: product.stock,
        tags: product.tags,
        rating: product.rating,
        reviewCount: product.reviewCount,
        categoryId: category.id,
        brandId: brand.id,
        isActive: true,
        isFeatured: product.tags.includes("TOP_VENTAS"),
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents ?? null,
        stock: product.stock,
        tags: product.tags,
        rating: product.rating,
        reviewCount: product.reviewCount,
        categoryId: category.id,
        brandId: brand.id,
        isActive: true,
        isFeatured: product.tags.includes("TOP_VENTAS"),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    for (const [index, url] of product.images.entries()) {
      await prisma.productImage.create({
        data: { productId: saved.id, url, publicId: `seed/${product.slug}-${index}`, order: index },
      });
    }
  }

  console.log("Vinculando productos compatibles...");
  for (const product of PRODUCTS) {
    if (!product.relatedSlugs?.length) continue;
    const current = await prisma.product.findUniqueOrThrow({ where: { slug: product.slug } });
    const related = await prisma.product.findMany({ where: { slug: { in: product.relatedSlugs } } });

    await prisma.product.update({
      where: { id: current.id },
      data: { relatedTo: { connect: related.map((r) => ({ id: r.id })) } },
    });
  }

  console.log("Sembrando cupón de ejemplo...");
  await prisma.coupon.upsert({
    where: { code: "RIDER10" },
    update: {},
    create: {
      code: "RIDER10",
      type: "PERCENTAGE",
      value: 10,
      minOrderCents: 50_000 * 100,
      isActive: true,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
