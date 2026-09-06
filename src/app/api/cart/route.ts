import { NextResponse } from "next/server";
import { getCartWithItems } from "@/lib/actions/cart";
import { availableQuantity } from "@/lib/inventory";
import { lineTotal, summarizeCart } from "@/lib/cart";

export async function GET() {
  const cart = await getCartWithItems();
  const summary = await summarizeCart(cart);

  const items =
    cart?.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.images[0]?.url ?? null,
      size: item.variant.size,
      color: item.variant.color,
      colorHex: item.variant.colorHex,
      unitPrice: item.variant.priceOverride ?? item.product.price,
      quantity: item.quantity,
      lineTotal: lineTotal(item),
      available: item.variant.inventory ? availableQuantity(item.variant.inventory) : 0,
    })) ?? [];

  return NextResponse.json({ items, summary });
}
