import { prisma } from "@/lib/prisma";

/** Envío gratis a partir de $200.000 COP (20.000.000 de centavos). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 200_000 * 100;

/** Tarifa usada cuando la ciudad del cliente no está en la tabla ShippingRate. */
const DEFAULT_SHIPPING_CENTS = 18_000 * 100;

export async function getShippingCents(city: string, subtotalCents: number): Promise<number> {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;

  const rate = await prisma.shippingRate.findFirst({
    where: { city: { equals: city, mode: "insensitive" } },
  });

  return rate?.priceCents ?? DEFAULT_SHIPPING_CENTS;
}

export const SEED_SHIPPING_RATES: { city: string; priceCents: number }[] = [
  { city: "Medellín", priceCents: 12_000 * 100 },
  { city: "Bogotá", priceCents: 14_000 * 100 },
  { city: "Cali", priceCents: 15_000 * 100 },
  { city: "Barranquilla", priceCents: 18_000 * 100 },
  { city: "Bucaramanga", priceCents: 16_000 * 100 },
  { city: "Pereira", priceCents: 15_000 * 100 },
  { city: "Cartagena", priceCents: 19_000 * 100 },
  { city: "Manizales", priceCents: 15_000 * 100 },
];
