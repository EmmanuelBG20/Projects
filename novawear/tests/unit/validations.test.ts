import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/lib/validations/checkout";
import { registerSchema } from "@/lib/validations/auth";
import { addToCartSchema } from "@/lib/validations/cart";
import { couponInputSchema } from "@/lib/validations/coupon";

const validCheckout = {
  firstName: "Camila",
  lastName: "Gómez",
  email: "camila@example.com",
  phone: "+573001112233",
  line1: "Calle 10 # 20-30",
  city: "Bogotá",
  department: "Bogotá D.C.",
  paymentMethod: "WOMPI",
};

describe("checkoutSchema", () => {
  it("accepts a well-formed checkout payload", () => {
    expect(checkoutSchema.safeParse(validCheckout).success).toBe(true);
  });

  it("rejects an invalid phone number", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, phone: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects a payment method outside the allowed set", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, paymentMethod: "MOCK" });
    expect(result.success).toBe(false);
  });

  it("requires a shipping address line", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, line1: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects weak passwords missing an uppercase letter or a digit", () => {
    expect(
      registerSchema.safeParse({ name: "Ana", email: "a@a.com", password: "lowercase" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ name: "Ana", email: "a@a.com", password: "NoDigitsHere" }).success,
    ).toBe(false);
  });

  it("accepts a strong password", () => {
    expect(
      registerSchema.safeParse({ name: "Ana", email: "a@a.com", password: "Password123" }).success,
    ).toBe(true);
  });
});

describe("addToCartSchema", () => {
  it("clamps to sane quantity bounds", () => {
    expect(addToCartSchema.safeParse({ variantId: "v1", quantity: 0 }).success).toBe(false);
    expect(addToCartSchema.safeParse({ variantId: "v1", quantity: 21 }).success).toBe(false);
    expect(addToCartSchema.safeParse({ variantId: "v1", quantity: 1 }).success).toBe(true);
  });
});

describe("couponInputSchema", () => {
  it("uppercases the coupon code", () => {
    const result = couponInputSchema.safeParse({ code: "verano20", type: "PERCENTAGE", value: 20 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.code).toBe("VERANO20");
  });

  it("rejects a non-positive value", () => {
    expect(couponInputSchema.safeParse({ code: "X10", type: "FIXED", value: 0 }).success).toBe(false);
  });

  it("treats an empty optional-number field as unset rather than 0", () => {
    // Regression: admin forms submit "" for an untouched number input.
    // z.coerce.number() alone turns "" into 0, which would silently pass
    // minSubtotal's .min(0) as "minimum $0" and fail maxUses' .min(1)
    // outright — both wrong. See the identical fix in validations/product.ts.
    const result = couponInputSchema.safeParse({
      code: "EMPTY1",
      type: "PERCENTAGE",
      value: 10,
      minSubtotal: "",
      maxUses: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minSubtotal).toBeUndefined();
      expect(result.data.maxUses).toBeUndefined();
    }
  });
});
