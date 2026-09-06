import { describe, expect, it } from "vitest";
import { discountPercentage, formatPrice, generateOrderNumber, slugify } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats COP amounts with no decimals", () => {
    expect(formatPrice(89900)).toContain("89.900");
  });
});

describe("slugify", () => {
  it("lowercases, strips accents, and dashes spaces", () => {
    expect(slugify("Camiseta Oversized Ink")).toBe("camiseta-oversized-ink");
    expect(slugify("Cinturón Leather Essential")).toBe("cinturon-leather-essential");
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  Hoodie   Essential! ")).toBe("hoodie-essential");
  });
});

describe("discountPercentage", () => {
  it("returns 0 when there is no compareAtPrice", () => {
    expect(discountPercentage(100_000, null)).toBe(0);
    expect(discountPercentage(100_000, undefined)).toBe(0);
  });

  it("returns 0 when compareAtPrice is not actually higher", () => {
    expect(discountPercentage(100_000, 100_000)).toBe(0);
    expect(discountPercentage(100_000, 90_000)).toBe(0);
  });

  it("computes the rounded percentage off", () => {
    expect(discountPercentage(259_900, 309_900)).toBe(16);
    expect(discountPercentage(75_000, 100_000)).toBe(25);
  });
});

describe("generateOrderNumber", () => {
  it("produces unique, NW-prefixed order numbers", () => {
    const numbers = new Set(Array.from({ length: 50 }, () => generateOrderNumber()));
    expect(numbers.size).toBe(50);
    for (const n of numbers) expect(n).toMatch(/^NW-[A-Z0-9]+$/);
  });
});
