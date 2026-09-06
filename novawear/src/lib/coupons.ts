import "server-only";
import { prisma } from "@/lib/prisma";

export interface CartLineForCoupon {
  productId: string;
  categoryId: string;
  lineTotal: number;
}

export interface CouponEvaluation {
  valid: boolean;
  error?: string;
  coupon?: Awaited<ReturnType<typeof findActiveCoupon>>;
  discountAmount: number;
}

async function findActiveCoupon(code: string) {
  return prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
    include: { products: true, categories: true },
  });
}

/**
 * Validates a coupon against the current cart contents and returns the
 * discount it grants. All checks run server-side — the client never decides
 * whether a coupon applies or how much it discounts.
 */
export async function evaluateCoupon(
  code: string,
  lines: CartLineForCoupon[],
  subtotal: number,
): Promise<CouponEvaluation> {
  const coupon = await findActiveCoupon(code);

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: "Cupón no válido.", discountAmount: 0 };
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { valid: false, error: "Este cupón todavía no está activo.", discountAmount: 0 };
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return { valid: false, error: "Este cupón expiró.", discountAmount: 0 };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Este cupón alcanzó su límite de usos.", discountAmount: 0 };
  }
  if (coupon.minSubtotal !== null && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      error: `Requiere un mínimo de compra de ${coupon.minSubtotal.toLocaleString("es-CO")} COP.`,
      discountAmount: 0,
    };
  }

  const hasScope = coupon.products.length > 0 || coupon.categories.length > 0;
  const productIds = new Set(coupon.products.map((p) => p.productId));
  const categoryIds = new Set(coupon.categories.map((c) => c.categoryId));

  const eligibleBase = hasScope
    ? lines
        .filter((l) => productIds.has(l.productId) || categoryIds.has(l.categoryId))
        .reduce((sum, l) => sum + l.lineTotal, 0)
    : subtotal;

  if (hasScope && eligibleBase === 0) {
    return {
      valid: false,
      error: "Este cupón no aplica a los productos en tu carrito.",
      discountAmount: 0,
    };
  }

  const discountAmount =
    coupon.type === "PERCENTAGE"
      ? Math.round((eligibleBase * coupon.value) / 100)
      : Math.min(coupon.value, eligibleBase);

  return { valid: true, coupon, discountAmount };
}

export async function recordCouponUsage(
  couponId: string,
  orderId: string,
  discountAmount: number,
  userId?: string | null,
) {
  await prisma.$transaction([
    prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }),
    prisma.couponUsage.create({
      data: { couponId, orderId, discountAmount, userId: userId ?? undefined },
    }),
  ]);
}
