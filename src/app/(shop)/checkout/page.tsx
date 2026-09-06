import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartWithItems } from "@/lib/actions/cart";
import { summarizeCart, lineTotal } from "@/lib/cart";
import { getCurrentUser } from "@/lib/session";
import { isProviderConfigured } from "@/lib/payments/provider";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, user] = await Promise.all([getCartWithItems(), getCurrentUser()]);

  if (!cart || cart.items.length === 0) {
    redirect("/shop");
  }

  const summary = await summarizeCart(cart);

  const lines = cart.items.map((item) => ({
    id: item.id,
    name: item.product.name,
    image: item.product.images[0]?.url ?? null,
    size: item.variant.size,
    color: item.variant.color,
    quantity: item.quantity,
    lineTotal: lineTotal(item),
  }));

  const analyticsItems = cart.items.map((item) => ({
    item_id: item.variantId,
    item_name: item.product.name,
    price: item.variant.priceOverride ?? item.product.price,
    quantity: item.quantity,
  }));

  const configuredProviders = {
    WOMPI: isProviderConfigured("WOMPI"),
    MERCADOPAGO: isProviderConfigured("MERCADOPAGO"),
    STRIPE: isProviderConfigured("STRIPE"),
  };

  return (
    <div className="container py-10 sm:py-14">
      <h1 className="mb-10 font-display text-3xl tracking-tight sm:text-4xl">Checkout</h1>
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <CheckoutForm
          configuredProviders={configuredProviders}
          defaultEmail={user?.email ?? undefined}
          cartValue={summary.total}
          cartItemsForAnalytics={analyticsItems}
        />
        <div className="lg:order-last">
          <OrderSummary items={lines} summary={summary} />
        </div>
      </div>
    </div>
  );
}
