import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  InsufficientStockError,
  availableQuantity,
  commitSaleForOrder,
  releaseInventoryForOrder,
  reserveInventoryForOrder,
} from "@/lib/inventory";

// Integration tests against the real (SQLite dev) database — they create and
// tear down their own throwaway category/product/variant so they never touch
// seeded catalog data.

let categoryId: string;
let productId: string;
let variantId: string;

async function setUpFixture(stock: number) {
  const category = await prisma.category.create({
    data: { name: "__test_category__", slug: `test-category-${Date.now()}` },
  });
  categoryId = category.id;

  const product = await prisma.product.create({
    data: {
      name: "__test_product__",
      slug: `test-product-${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      price: 10_000,
      description: "fixture",
      categoryId,
    },
  });
  productId = product.id;

  const variant = await prisma.productVariant.create({
    data: { productId, sku: `TEST-VARIANT-${Date.now()}`, size: "M", color: "Negro" },
  });
  variantId = variant.id;

  await prisma.inventory.create({ data: { variantId, quantity: stock, reserved: 0 } });
}

async function tearDownFixture() {
  await prisma.inventoryMovement.deleteMany({ where: { inventory: { variantId } } });
  await prisma.inventory.deleteMany({ where: { variantId } });
  await prisma.productVariant.deleteMany({ where: { id: variantId } });
  await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.category.deleteMany({ where: { id: categoryId } });
}

describe("inventory reservation", () => {
  afterAll(async () => {
    await tearDownFixture();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    if (variantId) await tearDownFixture();
  });

  it("reserves stock and reduces the available quantity", async () => {
    await setUpFixture(10);
    await reserveInventoryForOrder("order-1", [{ variantId, quantity: 3 }]);

    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { variantId } });
    expect(inventory.quantity).toBe(10);
    expect(inventory.reserved).toBe(3);
    expect(availableQuantity(inventory)).toBe(7);
  });

  it("throws InsufficientStockError instead of overselling", async () => {
    await setUpFixture(2);
    await expect(reserveInventoryForOrder("order-2", [{ variantId, quantity: 5 }])).rejects.toThrow(
      InsufficientStockError,
    );

    // No partial reservation should have leaked through.
    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { variantId } });
    expect(inventory.reserved).toBe(0);
  });

  it("never oversells when two checkouts race for the last unit", async () => {
    await setUpFixture(1);

    const results = await Promise.allSettled([
      reserveInventoryForOrder("order-race-a", [{ variantId, quantity: 1 }]),
      reserveInventoryForOrder("order-race-b", [{ variantId, quantity: 1 }]),
    ]);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { variantId } });
    expect(inventory.reserved).toBe(1);
    expect(availableQuantity(inventory)).toBe(0);
  });

  it("commitSaleForOrder converts a reservation into a permanent sale", async () => {
    await setUpFixture(10);
    await reserveInventoryForOrder("order-3", [{ variantId, quantity: 4 }]);
    await commitSaleForOrder("order-3", [{ variantId, quantity: 4 }]);

    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { variantId } });
    expect(inventory.quantity).toBe(6);
    expect(inventory.reserved).toBe(0);
  });

  it("releaseInventoryForOrder returns held stock without touching physical quantity", async () => {
    await setUpFixture(10);
    await reserveInventoryForOrder("order-4", [{ variantId, quantity: 4 }]);
    await releaseInventoryForOrder("order-4", [{ variantId, quantity: 4 }]);

    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { variantId } });
    expect(inventory.quantity).toBe(10);
    expect(inventory.reserved).toBe(0);
  });
});
