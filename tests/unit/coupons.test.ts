import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { evaluateCoupon } from "@/lib/coupons";

const oneLine = (productId: string, categoryId: string, lineTotal: number) => [
  { productId, categoryId, lineTotal },
];

describe("evaluateCoupon", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects an unknown code", async () => {
    const result = await evaluateCoupon("DOES-NOT-EXIST", [], 100_000);
    expect(result.valid).toBe(false);
  });

  it("applies a flat percentage coupon with no restrictions (WELCOME10, seeded)", async () => {
    const result = await evaluateCoupon("WELCOME10", oneLine("p1", "c1", 100_000), 100_000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(10_000);
  });

  it("enforces the minimum subtotal (NOVA50K requires >= 300000, seeded)", async () => {
    const tooLow = await evaluateCoupon("NOVA50K", oneLine("p1", "c1", 100_000), 100_000);
    expect(tooLow.valid).toBe(false);

    const enough = await evaluateCoupon("NOVA50K", oneLine("p1", "c1", 320_000), 320_000);
    expect(enough.valid).toBe(true);
    expect(enough.discountAmount).toBe(50_000);
  });

  it("rejects a coupon that already hit its usage limit (VIP5, seeded maxUses=5 usedCount=3)", async () => {
    // VIP5 seeds with usedCount below maxUses, so it should still be valid —
    // this guards the *limit* logic itself using a controlled scoped coupon.
    const scoped = await prisma.coupon.create({
      data: { code: `TEST-MAXUSES-${Date.now()}`, type: "PERCENTAGE", value: 10, maxUses: 1, usedCount: 1 },
    });
    try {
      const result = await evaluateCoupon(scoped.code, oneLine("p1", "c1", 100_000), 100_000);
      expect(result.valid).toBe(false);
    } finally {
      await prisma.coupon.delete({ where: { id: scoped.id } });
    }
  });

  it("rejects an expired coupon (EXPIRED10, seeded)", async () => {
    const result = await evaluateCoupon("EXPIRED10", oneLine("p1", "c1", 100_000), 100_000);
    expect(result.valid).toBe(false);
  });

  it("restricts a category-scoped coupon to matching lines only (VERANO20 → hoodies, seeded)", async () => {
    const hoodieCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "hoodies" } });
    const otherCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "accesorios" } });

    const matching = await evaluateCoupon(
      "VERANO20",
      oneLine("hoodie-product", hoodieCategory.id, 100_000),
      100_000,
    );
    expect(matching.valid).toBe(true);
    expect(matching.discountAmount).toBe(20_000);

    const nonMatching = await evaluateCoupon(
      "VERANO20",
      oneLine("accessory-product", otherCategory.id, 100_000),
      100_000,
    );
    expect(nonMatching.valid).toBe(false);
  });
});
