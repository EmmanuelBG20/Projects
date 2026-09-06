import "server-only";
import { prisma } from "@/lib/prisma";
import { availableQuantity } from "@/lib/inventory";
import { addItemToCart, getOrCreateCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

/**
 * Controlled tool surface for the WhatsApp assistant. This is the ONLY way
 * the AI (or the rule-based fallback) touches the database — it never gets a
 * raw query interface, only these narrow, purpose-built functions. Every
 * function returns plain, LLM-friendly data (strings/numbers), never Prisma
 * models directly.
 */

const STOPWORDS = new Set([
  "quiero", "quisiera", "busco", "buscando", "necesito", "tienen", "tienes", "hay",
  "algo", "favor", "porfa", "me", "mi", "que", "es", "son", "un", "una", "unos",
  "unas", "el", "la", "los", "las", "de", "del", "con", "por", "para", "en", "y",
  "o", "a", "the", "quisiera", "regalo", "regalar", "comprar", "ver", "muestrame",
  "muéstrame", "mostrar", "cuanto", "cuánto", "cuesta", "precio", "vale",
]);

/**
 * Splits free-form customer text ("quiero un hoodie negro talla M") into the
 * significant keywords ("hoodie", "negro", "talla", "M") a substring search
 * can actually match against — SQLite's `contains` has no natural-language
 * understanding, so searching the raw sentence almost never matches anything.
 */
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

export async function searchProducts(query: string, limit = 5) {
  const keywords = extractKeywords(query);
  const terms = keywords.length > 0 ? keywords : [query];

  // Tier 1: match the product itself (name/description/category) — e.g. the
  // "hoodie" in "hoodie negro". Color alone (tier 2) is a much weaker signal
  // since most products come in black, so it only kicks in when tier 1 finds
  // nothing (e.g. a bare "¿tienen algo negro?").
  const productMatch = terms.flatMap((term) => [
    { name: { contains: term } },
    { description: { contains: term } },
    { category: { name: { contains: term } } },
  ]);

  let products = await prisma.product.findMany({
    where: { status: "ACTIVE", OR: productMatch },
    include: { category: true, variants: { include: { inventory: true } } },
    take: limit,
  });

  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: { status: "ACTIVE", variants: { some: { OR: terms.map((term) => ({ color: { contains: term } })) } } },
      include: { category: true, variants: { include: { inventory: true } } },
      take: limit,
    });
  }

  return products.map((p) => ({
    productId: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    price: p.price,
    priceFormatted: formatPrice(p.price),
    inStock: p.variants.some((v) => v.inventory && availableQuantity(v.inventory) > 0),
    colors: [...new Set(p.variants.map((v) => v.color))],
    sizes: [...new Set(p.variants.map((v) => v.size))],
  }));
}

export async function getProduct(productIdOrSlug: string) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }], status: "ACTIVE" },
    include: { category: true, variants: { include: { inventory: true } } },
  });
  if (!product) return null;

  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    price: product.price,
    priceFormatted: formatPrice(product.price),
    description: product.description,
    variants: product.variants.map((v) => ({
      variantId: v.id,
      size: v.size,
      color: v.color,
      available: v.inventory ? availableQuantity(v.inventory) : 0,
    })),
  };
}

export async function checkInventory(productIdOrSlug: string, size?: string, color?: string) {
  const product = await getProduct(productIdOrSlug);
  if (!product) return { found: false as const };

  const matches = product.variants.filter(
    (v) => (!size || v.size.toLowerCase() === size.toLowerCase()) && (!color || v.color.toLowerCase() === color.toLowerCase()),
  );

  return {
    found: true as const,
    productName: product.name,
    variants: matches.map((v) => ({ size: v.size, color: v.color, available: v.available })),
  };
}

/** Resolves (or creates) the cart tied to a WhatsApp phone number. */
async function resolveCartForPhone(phoneNumber: string) {
  const user = await prisma.user.findFirst({ where: { phone: phoneNumber } });
  if (user) return getOrCreateCart({ userId: user.id });
  return getOrCreateCart({ guestToken: `whatsapp:${phoneNumber}` });
}

export async function createCart(phoneNumber: string) {
  const cart = await resolveCartForPhone(phoneNumber);
  return { cartId: cart.id };
}

export async function addToCart(phoneNumber: string, variantId: string, quantity = 1) {
  const cart = await resolveCartForPhone(phoneNumber);
  try {
    await addItemToCart(cart.id, variantId, quantity);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "No se pudo agregar" };
  }
}

export async function getCustomerOrders(phoneNumber: string, limit = 5) {
  const orders = await prisma.order.findMany({
    where: { phone: phoneNumber },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { orderNumber: true, status: true, total: true, createdAt: true },
  });
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    status: o.status,
    totalFormatted: formatPrice(o.total),
    createdAt: o.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getOrderStatus(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { orderNumber: true, status: true, trackingCarrier: true, trackingNumber: true },
  });
  if (!order) return null;
  return order;
}

export async function createSupportTicket(input: {
  phoneNumber: string;
  subject: string;
  message: string;
}) {
  const ticket = await prisma.supportTicket.create({
    data: {
      phone: input.phoneNumber,
      subject: input.subject,
      message: input.message,
      source: "WHATSAPP",
      status: "OPEN",
    },
  });

  // Escalating creates the ticket AND hands the conversation to a human —
  // the bot goes silent (see handleIncomingWhatsAppMessage) until an admin
  // hands it back via /admin/whatsapp, so it never talks over the advisor.
  await prisma.whatsappConversation.updateMany({
    where: { phoneNumber: input.phoneNumber },
    data: { status: "HUMAN" },
  });

  return { ticketId: ticket.id };
}
