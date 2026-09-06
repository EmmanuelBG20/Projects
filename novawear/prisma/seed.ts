/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;
}

const IMAGES = {
  teeWhite: unsplash("1521572163474-6864f9cf17ab"),
  teeGraphic: unsplash("1503341504253-dff4815485f1"),
  hoodieBack: unsplash("1556821840-3a63f95609a7"),
  hoodieTexture: unsplash("1551028719-00167b16eac5"),
  bomberFlat: unsplash("1591047139829-d91aecb6caea"),
  denimJacket: unsplash("1611312449408-fcece27cdbb7"),
  blueJacket: unsplash("1543076447-215ad9ba6923"),
  pantsHangers: unsplash("1523381210434-271e8be1f52b"),
  denimRack: unsplash("1560243563-062bfc001d68"),
  pantsRack: unsplash("1445205170230-053b83016050"),
  cap: unsplash("1521369909029-2afed882baee"),
  bag: unsplash("1584917865442-de89df76afd3"),
  accessoriesFlat: unsplash("1516762689617-e1cffcef479d"),
  storeRack: unsplash("1441986300917-64674bd600d8"),
};

const COLORS: Record<string, string> = {
  Negro: "#111111",
  Blanco: "#F5F5F0",
  Gris: "#8C8C86",
  Arena: "#C9B79C",
  "Verde Oliva": "#5C6B4F",
  "Azul Marino": "#26344A",
  Terracota: "#8A5A3B",
  Vino: "#6E2A34",
  Única: "#111111",
};

// Deterministic-but-varied stock levels so the demo always shows a healthy
// mix of in-stock, low-stock (<= lowStockThreshold) and sold-out variants.
const STOCK_CYCLE = [24, 15, 9, 3, 0, 18, 6, 30, 12, 4];
function stockFor(i: number) {
  return STOCK_CYCLE[i % STOCK_CYCLE.length];
}

interface ProductSeed {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  story?: string;
  material: string;
  careInstructions: string;
  categorySlug: string;
  images: string[];
  colors: string[];
  sizes: string[];
  isFeatured?: boolean;
  isNew?: boolean;
}

async function createProduct(p: ProductSeed) {
  const slug = slugify(p.name);
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.categorySlug } });

  const product = await prisma.product.create({
    data: {
      name: p.name,
      slug,
      sku: p.sku,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      description: p.description,
      story: p.story,
      material: p.material,
      careInstructions: p.careInstructions,
      categoryId: category.id,
      isFeatured: p.isFeatured ?? false,
      isNew: p.isNew ?? false,
      images: {
        create: p.images.map((url, i) => ({ url, position: i, alt: p.name })),
      },
    },
  });

  let variantIndex = 0;
  for (const size of p.sizes) {
    for (const color of p.colors) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `${p.sku}-${slugify(size)}-${slugify(color)}`.toUpperCase(),
          size,
          color,
          colorHex: COLORS[color] ?? "#111111",
          position: variantIndex,
        },
      });
      const quantity = stockFor(variantIndex + p.sku.length);
      const inventory = await prisma.inventory.create({
        data: { variantId: variant.id, quantity, reserved: 0 },
      });
      await prisma.inventoryMovement.create({
        data: { inventoryId: inventory.id, type: "RESTOCK", quantity, reason: "Carga inicial de inventario" },
      });
      variantIndex += 1;
    }
  }

  return product;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Limpiando base de datos…");
  await prisma.$transaction([
    prisma.whatsappMessage.deleteMany(),
    prisma.whatsappConversation.deleteMany(),
    prisma.supportTicket.deleteMany(),
    prisma.couponUsage.deleteMany(),
    prisma.couponProduct.deleteMany(),
    prisma.couponCategory.deleteMany(),
    prisma.review.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.inventoryMovement.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.address.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.webhookEvent.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Creando categorías…");
  const categoriesData = [
    { name: "Camisetas", slug: "camisetas", image: IMAGES.teeWhite, description: "Básicos de algodón premium, corte moderno." },
    { name: "Hoodies", slug: "hoodies", image: IMAGES.hoodieBack, description: "Buzos de felpa pesada para el día a día." },
    { name: "Pantalones", slug: "pantalones", image: IMAGES.pantsHangers, description: "Joggers, cargos y pantalones de sastrería relajada." },
    { name: "Chaquetas", slug: "chaquetas", image: IMAGES.bomberFlat, description: "Capas exteriores para cada estación." },
    { name: "Accesorios", slug: "accesorios", image: IMAGES.cap, description: "Los detalles que completan el look." },
  ];
  for (const c of categoriesData) {
    await prisma.category.create({ data: c });
  }

  console.log("Creando productos…");

  const products: ProductSeed[] = [
    // ---- Camisetas -----------------------------------------------------
    {
      name: "Camiseta Essential Cotton",
      sku: "CAM-ESS",
      price: 89_900,
      description:
        "La camiseta base de NOVAWEAR: algodón peinado de 220gsm, corte recto y cuello reforzado que no pierde forma.",
      material: "100% algodón peinado, 220 gsm",
      careInstructions: "Lavar en frío, no usar blanqueador, secar a la sombra.",
      categorySlug: "camisetas",
      images: [IMAGES.teeWhite, IMAGES.storeRack],
      colors: ["Negro", "Blanco", "Gris"],
      sizes: ["XS", "S", "M", "L", "XL"],
      isFeatured: true,
    },
    {
      name: "Camiseta Oversized Ink",
      sku: "CAM-INK",
      price: 99_900,
      compareAtPrice: 129_900,
      description: "Silueta oversized con caída relajada en los hombros. Tejido pesado que mantiene la estructura.",
      material: "100% algodón, 240 gsm",
      careInstructions: "Lavar en frío del revés, secado en línea.",
      categorySlug: "camisetas",
      images: [IMAGES.teeWhite],
      colors: ["Negro", "Arena"],
      sizes: ["S", "M", "L", "XL"],
      isNew: true,
    },
    {
      name: "Camiseta Ribbed Muscle",
      sku: "CAM-RIB",
      price: 79_900,
      description: "Tejido acanalado ajustado, ideal como capa base o para usar sola en temporada de calor.",
      material: "95% algodón, 5% elastano",
      careInstructions: "Lavar en frío, secado a la sombra.",
      categorySlug: "camisetas",
      images: [IMAGES.teeGraphic],
      colors: ["Negro", "Blanco"],
      sizes: ["XS", "S", "M", "L"],
    },
    {
      name: "Camiseta Boxy Crop",
      sku: "CAM-CROP",
      price: 84_900,
      description: "Corte boxy cropped con dobladillo crudo. Pensada para combinar con pantalones de tiro alto.",
      material: "100% algodón orgánico",
      careInstructions: "Lavar en frío, no secar en máquina.",
      categorySlug: "camisetas",
      images: [IMAGES.teeWhite],
      colors: ["Blanco", "Verde Oliva"],
      sizes: ["XS", "S", "M", "L"],
      isFeatured: true,
    },
    {
      name: "Camiseta Graphic Print",
      sku: "CAM-GRA",
      price: 94_900,
      compareAtPrice: 119_900,
      description: "Estampado serigrafiado a mano sobre algodón grueso, con acabado envejecido.",
      material: "100% algodón, 230 gsm",
      careInstructions: "Lavar del revés en frío para conservar el estampado.",
      categorySlug: "camisetas",
      images: [IMAGES.teeGraphic],
      colors: ["Negro"],
      sizes: ["S", "M", "L", "XL"],
      isNew: true,
    },

    // ---- Hoodies ---------------------------------------------------------
    {
      name: "Hoodie Essential",
      sku: "HOO-ESS",
      price: 189_900,
      description:
        "El hoodie insignia de NOVAWEAR. Felpa cepillada de 400gsm, capucha de doble capa y bolsillo canguro reforzado.",
      story:
        "Diseñado durante dos temporadas de prueba hasta encontrar el punto exacto entre calidez y estructura — el hoodie que usarías todos los días del año.",
      material: "80% algodón, 20% poliéster, felpa 400 gsm",
      careInstructions: "Lavar en frío, no planchar el estampado, secado a la sombra.",
      categorySlug: "hoodies",
      images: [IMAGES.hoodieBack, IMAGES.hoodieTexture],
      colors: ["Negro", "Blanco", "Gris"],
      sizes: ["XS", "S", "M", "L", "XL"],
      isFeatured: true,
    },
    {
      name: "Hoodie Heavyweight Zip",
      sku: "HOO-ZIP",
      price: 219_900,
      compareAtPrice: 259_900,
      description: "Versión full-zip del Essential, con cremallera YKK y puños acanalados dobles.",
      material: "100% algodón, felpa 420 gsm",
      careInstructions: "Cerrar la cremallera antes de lavar, secado a la sombra.",
      categorySlug: "hoodies",
      images: [IMAGES.hoodieTexture],
      colors: ["Negro", "Azul Marino"],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Hoodie Cropped Fleece",
      sku: "HOO-CRO",
      price: 179_900,
      description: "Largo cropped con capucha ajustable, pensado para combinar con pantalones de tiro alto.",
      material: "70% algodón, 30% poliéster",
      careInstructions: "Lavar en frío, secado a la sombra.",
      categorySlug: "hoodies",
      images: [IMAGES.hoodieBack],
      colors: ["Arena", "Gris"],
      sizes: ["XS", "S", "M", "L"],
    },
    {
      name: "Hoodie Oversized Graphic",
      sku: "HOO-GRA",
      price: 199_900,
      description: "Silueta oversized con arte gráfico en la espalda, felpa perchada por dentro.",
      material: "100% algodón, felpa 380 gsm",
      careInstructions: "Lavar del revés en frío.",
      categorySlug: "hoodies",
      images: [IMAGES.hoodieTexture, IMAGES.hoodieBack],
      colors: ["Negro", "Vino"],
      sizes: ["S", "M", "L", "XL"],
      isNew: true,
    },

    // ---- Pantalones --------------------------------------------------
    {
      name: "Jogger Essential",
      sku: "PAN-JOG",
      price: 149_900,
      description: "Jogger de felpa con puños ajustados y bolsillos con cierre. Comodidad sin perder estructura.",
      material: "80% algodón, 20% poliéster",
      careInstructions: "Lavar en frío, secado a la sombra.",
      categorySlug: "pantalones",
      images: [IMAGES.pantsRack, IMAGES.pantsHangers],
      colors: ["Negro", "Gris", "Arena"],
      sizes: ["XS", "S", "M", "L", "XL"],
      isFeatured: true,
    },
    {
      name: "Cargo Pant Utility",
      sku: "PAN-CAR",
      price: 169_900,
      description: "Pantalón cargo con seis bolsillos funcionales y cordón ajustable en el tobillo.",
      material: "98% algodón, 2% elastano, ripstop",
      careInstructions: "Lavar en frío, no usar secadora.",
      categorySlug: "pantalones",
      images: [IMAGES.pantsRack],
      colors: ["Verde Oliva", "Negro"],
      sizes: ["S", "M", "L", "XL"],
      isNew: true,
    },
    {
      name: "Pantalón Recto Wool-Blend",
      sku: "PAN-WOL",
      price: 219_900,
      compareAtPrice: 259_900,
      description: "Corte recto de sastrería relajada en mezcla de lana, ideal para looks elevados.",
      material: "70% lana, 30% poliéster",
      careInstructions: "Lavado en seco recomendado.",
      categorySlug: "pantalones",
      images: [IMAGES.pantsHangers],
      colors: ["Gris", "Azul Marino"],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Jean Straight Selvedge",
      sku: "PAN-JEA",
      price: 249_900,
      description: "Denim selvedge de 14oz, corte recto clásico que envejece con carácter propio.",
      material: "100% algodón selvedge, 14 oz",
      careInstructions: "Primer lavado en frío del revés; lavar lo menos posible para conservar el índigo.",
      categorySlug: "pantalones",
      images: [IMAGES.denimRack],
      colors: ["Azul Marino"],
      sizes: ["XS", "S", "M", "L", "XL"],
    },

    // ---- Chaquetas -----------------------------------------------------
    {
      name: "Chaqueta Bomber Nylon",
      sku: "CHA-BOM",
      price: 259_900,
      compareAtPrice: 309_900,
      description: "Bomber en nylon con forro acolchado ligero, puños y cintura en rib.",
      material: "Exterior 100% nylon, forro poliéster",
      careInstructions: "Lavado en seco o lavado suave en frío, colgar para secar.",
      categorySlug: "chaquetas",
      images: [IMAGES.bomberFlat],
      colors: ["Negro", "Terracota"],
      sizes: ["S", "M", "L", "XL"],
      isFeatured: true,
    },
    {
      name: "Chaqueta Denim Trucker",
      sku: "CHA-DEN",
      price: 219_900,
      description: "Trucker jacket clásica en denim rígido con botones metálicos y bolsillos de pecho.",
      material: "100% algodón denim, 12 oz",
      careInstructions: "Lavar en frío del revés, secado a la sombra.",
      categorySlug: "chaquetas",
      images: [IMAGES.denimJacket],
      colors: ["Azul Marino"],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Chaqueta Puffer Featherlight",
      sku: "CHA-PUF",
      price: 349_900,
      description: "Puffer ultraligera con relleno sintético térmico y empaque compacto incluido.",
      material: "Exterior nylon ripstop, relleno sintético 100g",
      careInstructions: "Lavado suave en frío, secado a baja temperatura con pelotas de secado.",
      categorySlug: "chaquetas",
      images: [IMAGES.blueJacket],
      colors: ["Azul Marino", "Negro"],
      sizes: ["S", "M", "L", "XL"],
      isNew: true,
    },
    {
      name: "Chaqueta Cortavientos Packable",
      sku: "CHA-COR",
      price: 189_900,
      description: "Cortavientos empacable en su propio bolsillo, costuras selladas resistentes al agua.",
      material: "100% nylon con recubrimiento DWR",
      careInstructions: "Limpiar con paño húmedo, evitar secadora.",
      categorySlug: "chaquetas",
      images: [IMAGES.blueJacket, IMAGES.denimJacket],
      colors: ["Negro", "Gris"],
      sizes: ["S", "M", "L", "XL"],
    },

    // ---- Accesorios ------------------------------------------------------
    {
      name: "Gorra Structured Logo",
      sku: "ACC-GOR",
      price: 69_900,
      description: "Gorra de seis paneles con logo bordado y cierre trasero ajustable.",
      material: "100% algodón",
      careInstructions: "Limpiar con paño húmedo.",
      categorySlug: "accesorios",
      images: [IMAGES.cap],
      colors: ["Negro", "Arena"],
      sizes: ["Única"],
    },
    {
      name: "Beanie Ribbed Wool",
      sku: "ACC-BEA",
      price: 59_900,
      description: "Gorro de punto acanalado en mezcla de lana, calce ajustado.",
      material: "70% lana, 30% acrílico",
      careInstructions: "Lavado a mano en frío.",
      categorySlug: "accesorios",
      images: [IMAGES.accessoriesFlat],
      colors: ["Negro", "Gris", "Vino"],
      sizes: ["Única"],
    },
    {
      name: "Bolso Tote Canvas",
      sku: "ACC-TOT",
      price: 129_900,
      description: "Tote de lona resistente con asas reforzadas y bolsillo interior con cierre.",
      material: "100% lona de algodón",
      careInstructions: "Limpiar con paño húmedo, no sumergir.",
      categorySlug: "accesorios",
      images: [IMAGES.bag],
      colors: ["Arena", "Negro"],
      sizes: ["Única"],
      isNew: true,
    },
    {
      name: "Cinturón Leather Essential",
      sku: "ACC-CIN",
      price: 89_900,
      description: "Cinturón de cuero curtido vegetal con hebilla metálica minimalista.",
      material: "100% cuero genuino",
      careInstructions: "Limpiar con paño seco, evitar exposición prolongada al agua.",
      categorySlug: "accesorios",
      images: [IMAGES.accessoriesFlat],
      colors: ["Negro", "Terracota"],
      sizes: ["Única"],
    },
    {
      name: "Medias Pack x3",
      sku: "ACC-MED",
      price: 39_900,
      description: "Pack de tres pares de medias de algodón con refuerzo en talón y punta.",
      material: "80% algodón, 15% poliéster, 5% elastano",
      careInstructions: "Lavado en máquina en frío.",
      categorySlug: "accesorios",
      images: [IMAGES.accessoriesFlat],
      colors: ["Negro", "Blanco"],
      sizes: ["Única"],
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    createdProducts.push(await createProduct(p));
  }
  console.log(`  ${createdProducts.length} productos creados.`);

  // ---- Users -------------------------------------------------------------
  console.log("Creando usuarios…");
  const passwordHash = await bcrypt.hash("Novawear123", 12);

  const admin = await prisma.user.create({
    data: { name: "Ana Restrepo", email: "admin@novawear.co", passwordHash, role: "ADMIN", phone: "+573001112233" },
  });
  const manager = await prisma.user.create({
    data: { name: "Julián Torres", email: "manager@novawear.co", passwordHash, role: "MANAGER", phone: "+573001112244" },
  });
  const customers = await Promise.all(
    [
      { name: "Camila Gómez", email: "camila@example.com" },
      { name: "Sebastián Ruiz", email: "sebastian@example.com" },
      { name: "Valentina Ortiz", email: "valentina@example.com" },
      { name: "Andrés Salazar", email: "andres@example.com" },
    ].map((c, i) =>
      prisma.user.create({
        data: {
          name: c.name,
          email: c.email,
          passwordHash,
          role: "CUSTOMER",
          phone: `+57300111${(2000 + i).toString().slice(-4)}`,
        },
      }),
    ),
  );

  for (const [i, customer] of customers.entries()) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        firstName: customer.name.split(" ")[0],
        lastName: customer.name.split(" ")[1] ?? "",
        phone: customer.phone ?? "+573000000000",
        line1: `Calle ${10 + i} # ${20 + i}-${30 + i}`,
        city: ["Bogotá", "Medellín", "Cali", "Barranquilla"][i % 4],
        department: ["Bogotá D.C.", "Antioquia", "Valle del Cauca", "Atlántico"][i % 4],
        country: "CO",
        isDefault: true,
      },
    });
  }
  console.log(`  ${customers.length + 2} usuarios creados (admin, manager, ${customers.length} clientes). Password: Novawear123`);

  // ---- Coupons -------------------------------------------------------------
  console.log("Creando cupones…");
  const hoodieCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "hoodies" } });

  await prisma.coupon.create({
    data: { code: "WELCOME10", type: "PERCENTAGE", value: 10, isActive: true },
  });
  await prisma.coupon.create({
    data: { code: "NOVA50K", type: "FIXED", value: 50_000, minSubtotal: 300_000, isActive: true },
  });
  await prisma.coupon.create({
    data: {
      code: "VERANO20",
      type: "PERCENTAGE",
      value: 20,
      isActive: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      categories: { create: [{ categoryId: hoodieCategory.id }] },
    },
  });
  await prisma.coupon.create({
    data: {
      code: "VIP5",
      type: "PERCENTAGE",
      value: 15,
      isActive: true,
      maxUses: 5,
      usedCount: 3,
    },
  });
  await prisma.coupon.create({
    data: {
      code: "EXPIRED10",
      type: "PERCENTAGE",
      value: 10,
      isActive: true,
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });
  console.log("  5 cupones creados.");

  // ---- Sample orders ---------------------------------------------------
  console.log("Creando pedidos de ejemplo…");

  const variantsByProduct = await Promise.all(
    createdProducts.map((p) =>
      prisma.productVariant.findMany({ where: { productId: p.id }, include: { inventory: true } }),
    ),
  );

  const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
  let orderCounter = 1000;

  for (let i = 0; i < 8; i++) {
    const customer = customers[i % customers.length];
    const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id } });
    const status = STATUSES[i % STATUSES.length];

    const pick = variantsByProduct[i % variantsByProduct.length];
    const variant = pick[i % pick.length];
    const product = createdProducts[i % createdProducts.length];
    const quantity = 1 + (i % 2);
    const unitPrice = variant.priceOverride ?? product.price;
    const subtotal = unitPrice * quantity;
    const shippingTotal = subtotal >= 250_000 ? 0 : 14_900;
    const total = subtotal + shippingTotal;

    orderCounter += 1;
    const order = await prisma.order.create({
      data: {
        orderNumber: `NW-${orderCounter}`,
        userId: customer.id,
        email: customer.email,
        phone: address.phone,
        status,
        paymentMethod: "MOCK",
        paymentStatus: status === "CANCELLED" ? "DECLINED" : status === "PENDING" ? "PENDING" : "APPROVED",
        subtotal,
        shippingTotal,
        total,
        shippingFirstName: address.firstName,
        shippingLastName: address.lastName,
        shippingPhone: address.phone,
        shippingLine1: address.line1,
        shippingCity: address.city,
        shippingDepartment: address.department,
        shippingCountry: address.country,
        trackingCarrier: status === "SHIPPED" || status === "DELIVERED" ? "Servientrega" : null,
        trackingNumber: status === "SHIPPED" || status === "DELIVERED" ? `SVE${100000 + i}` : null,
        items: {
          create: [
            {
              productId: product.id,
              variantId: variant.id,
              productName: product.name,
              variantSize: variant.size,
              variantColor: variant.color,
              sku: variant.sku,
              unitPrice,
              quantity,
              total: subtotal,
            },
          ],
        },
        statusHistory: {
          create: [{ status: "PENDING", note: "Pedido creado" }, ...(status !== "PENDING" ? [{ status, note: "Actualización automática (seed)" }] : [])],
        },
        payments: {
          create: [
            {
              provider: "MOCK",
              status: status === "CANCELLED" ? "DECLINED" : status === "PENDING" ? "PENDING" : "APPROVED",
              amount: total,
              providerRef: `mock_${orderCounter}`,
            },
          ],
        },
      },
    });

    void order;
  }
  console.log("  8 pedidos de ejemplo creados.");

  // ---- Reviews -----------------------------------------------------------
  console.log("Creando reseñas…");
  const reviewTexts = [
    { rating: 5, title: "Superó mis expectativas", comment: "La tela es mucho más gruesa de lo que esperaba, se siente premium de verdad." },
    { rating: 4, title: "Muy buena calidad", comment: "El corte queda tal cual la foto. Le resto una estrella porque tardó unos días extra en llegar." },
    { rating: 5, title: "Mi favorita del clóset", comment: "Ya la he lavado varias veces y no ha perdido forma ni color." },
    { rating: 3, title: "Buena pero ajustada", comment: "La calidad es buena pero pediría una talla más si eres de contextura ancha." },
    { rating: 5, title: "Vale cada peso", comment: "Se nota el material premium desde que la abres del empaque." },
  ];

  let reviewCount = 0;
  for (let i = 0; i < createdProducts.length; i += 3) {
    const product = createdProducts[i];
    const reviewers = customers.slice(0, 2 + (i % 3));
    for (const [ri, reviewer] of reviewers.entries()) {
      const text = reviewTexts[(i + ri) % reviewTexts.length];
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: reviewer.id,
          rating: text.rating,
          title: text.title,
          comment: text.comment,
          isVerifiedPurchase: ri === 0,
        },
      });
      reviewCount += 1;
    }
    const agg = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
  }
  console.log(`  ${reviewCount} reseñas creadas.`);

  // ---- Support & WhatsApp demo data --------------------------------------
  console.log("Creando conversación de WhatsApp de ejemplo…");
  const conversation = await prisma.whatsappConversation.create({
    data: {
      phoneNumber: "+573009998877",
      customerName: "Cliente WhatsApp Demo",
      status: "BOT",
      context: JSON.stringify({ step: "browsing" }),
      messages: {
        create: [
          { direction: "INBOUND", content: "Hola" },
          {
            direction: "OUTBOUND",
            content: "¡Hola! 👋 Soy el asistente de NOVAWEAR. ¿Qué estás buscando hoy?",
          },
          { direction: "INBOUND", content: "Quiero un hoodie negro talla M" },
          {
            direction: "OUTBOUND",
            content:
              "Encontré Hoodie Essential en Negro, talla M — disponible. Precio: $189.900 COP. ¿Quieres que lo agregue a tu carrito?",
          },
        ],
      },
    },
  });
  void conversation;

  await prisma.supportTicket.create({
    data: {
      email: "camila@example.com",
      subject: "Cambio de talla",
      message: "Quisiera cambiar la talla M por una L en mi último pedido.",
      source: "WEB",
      status: "OPEN",
    },
  });
  await prisma.supportTicket.create({
    data: {
      phone: "+573009998877",
      subject: "Conversación escalada desde WhatsApp",
      message: "Cliente solicitó hablar con un asesor humano.",
      source: "WHATSAPP",
      status: "IN_PROGRESS",
    },
  });
  console.log("  Datos de soporte y WhatsApp creados.");

  console.log("\nSeed completado.");
  console.log("Usuarios de prueba (password: Novawear123):");
  console.log("  ADMIN   -> admin@novawear.co");
  console.log("  MANAGER -> manager@novawear.co");
  console.log("  CLIENTE -> camila@example.com (y 3 más)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
