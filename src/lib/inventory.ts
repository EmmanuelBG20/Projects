import "server-only";
import { prisma } from "@/lib/prisma";
import type { InventoryMovementType } from "@/lib/constants";

export class InsufficientStockError extends Error {
  constructor(public variantId: string) {
    super(`Stock insuficiente para la variante ${variantId}`);
    this.name = "InsufficientStockError";
  }
}

export function availableQuantity(inventory: { quantity: number; reserved: number }) {
  return Math.max(0, inventory.quantity - inventory.reserved);
}

export async function getAvailableForVariants(variantIds: string[]) {
  const rows = await prisma.inventory.findMany({ where: { variantId: { in: variantIds } } });
  const map = new Map<string, number>();
  for (const row of rows) map.set(row.variantId, availableQuantity(row));
  return map;
}

/**
 * Reserves stock for every line item of an order inside a single
 * all-or-nothing transaction. Uses a conditional UPDATE (`WHERE quantity -
 * reserved >= :qty`) rather than relying purely on transaction isolation, so
 * concurrent checkouts on the same variant can never oversell it regardless
 * of the database engine (works identically on SQLite and PostgreSQL).
 */
export async function reserveInventoryForOrder(
  orderId: string,
  items: { variantId: string; quantity: number }[],
) {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const inventory = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
      if (!inventory) throw new InsufficientStockError(item.variantId);

      const affected = await tx.$executeRaw`
        UPDATE "Inventory"
        SET reserved = reserved + ${item.quantity}, updatedAt = CURRENT_TIMESTAMP
        WHERE variantId = ${item.variantId}
          AND (quantity - reserved) >= ${item.quantity}
      `;
      if (affected === 0) throw new InsufficientStockError(item.variantId);

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: "RESERVATION" satisfies InventoryMovementType,
          quantity: item.quantity,
          orderId,
        },
      });
    }
  });
}

/** Releases a previously-held reservation (cancelled/expired/declined order). */
export async function releaseInventoryForOrder(
  orderId: string,
  items: { variantId: string; quantity: number }[],
) {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const inventory = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
      if (!inventory) continue;

      await tx.$executeRaw`
        UPDATE "Inventory"
        SET reserved = MAX(0, reserved - ${item.quantity}), updatedAt = CURRENT_TIMESTAMP
        WHERE variantId = ${item.variantId}
      `;
      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: "RELEASE" satisfies InventoryMovementType,
          quantity: -item.quantity,
          orderId,
        },
      });
    }
  });
}

/** Converts a reservation into an actual sale once payment is approved. */
export async function commitSaleForOrder(
  orderId: string,
  items: { variantId: string; quantity: number }[],
) {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const inventory = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
      if (!inventory) continue;

      await tx.$executeRaw`
        UPDATE "Inventory"
        SET quantity = MAX(0, quantity - ${item.quantity}),
            reserved = MAX(0, reserved - ${item.quantity}),
            updatedAt = CURRENT_TIMESTAMP
        WHERE variantId = ${item.variantId}
      `;
      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: "SALE" satisfies InventoryMovementType,
          quantity: -item.quantity,
          orderId,
        },
      });
    }
  });
}

export async function restockVariant(
  variantId: string,
  quantity: number,
  { reason, userId }: { reason?: string; userId?: string } = {},
) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.upsert({
      where: { variantId },
      update: { quantity: { increment: quantity } },
      create: { variantId, quantity, reserved: 0 },
    });
    await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        type: "RESTOCK" satisfies InventoryMovementType,
        quantity,
        reason,
        createdById: userId,
      },
    });
    return inventory;
  });
}

export async function adjustVariantStock(
  variantId: string,
  newQuantity: number,
  { reason, userId }: { reason?: string; userId?: string } = {},
) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { variantId } });
    if (!inventory) throw new Error("Inventario no encontrado");
    const delta = newQuantity - inventory.quantity;
    await tx.inventory.update({ where: { variantId }, data: { quantity: newQuantity } });
    await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        type: "ADJUSTMENT" satisfies InventoryMovementType,
        quantity: delta,
        reason,
        createdById: userId,
      },
    });
    return delta;
  });
}
