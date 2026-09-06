import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartSummary } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout — BASTI MOTOS" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/iniciar-sesion?callbackUrl=/checkout");
  }

  const [addresses, cart] = await Promise.all([
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
    getCartSummary(session.user.id),
  ]);

  if (cart.lines.length === 0) {
    return (
      <div className="container-app py-24 text-center">
        <h1 className="section-title">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-primary">Ver productos</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <h1 className="section-title">Finalizar compra</h1>
      <CheckoutForm addresses={addresses} lines={cart.lines} subtotalCents={cart.subtotalCents} />
    </div>
  );
}
