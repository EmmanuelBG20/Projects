import { prisma } from "@/lib/prisma";
import type { CartSummary, GuestCartItem } from "@/types";

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

/** Suma las cantidades de un carrito de invitado (localStorage) al carrito en BD. */
export async function mergeGuestCartIntoDb(userId: string, guestItems: GuestCartItem[]) {
  if (guestItems.length === 0) return;

  const cart = await getOrCreateCart(userId);

  for (const item of guestItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.isActive) continue;

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
    });

    const desiredQuantity = (existingItem?.quantity ?? 0) + item.quantity;
    const cappedQuantity = Math.min(desiredQuantity, Math.max(product.stock, 0), 20);

    if (cappedQuantity <= 0) continue;

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      create: { cartId: cart.id, productId: item.productId, quantity: cappedQuantity },
      update: { quantity: cappedQuantity },
    });
  }
}

export async function addItemToCart(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new Error("Producto no disponible");
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;
  const cappedQuantity = Math.min(desiredQuantity, Math.max(product.stock, 0), 20);

  if (cappedQuantity <= 0) {
    throw new Error("Producto sin stock disponible");
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity: cappedQuantity },
    update: { quantity: cappedQuantity },
  });
}

export async function setCartItemQuantity(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const cappedQuantity = Math.min(quantity, Math.max(product.stock, 0), 20);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity: cappedQuantity },
    update: { quantity: cappedQuantity },
  });
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
}

export async function getCartSummary(userId: string): Promise<CartSummary> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) return { lines: [], subtotalCents: 0, itemCount: 0 };

  const lines = cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    slug: item.product.slug,
    imageUrl: item.product.images[0]?.url ?? null,
    unitPriceCents: item.product.priceCents,
    quantity: item.quantity,
    stock: item.product.stock,
    lineTotalCents: item.product.priceCents * item.quantity,
  }));

  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return { lines, subtotalCents, itemCount };
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
