/** Utilidades de dinero. Toda la app trabaja internamente en centavos (Int). */

export function centsToCOP(cents: number): string {
  const pesos = Math.round(cents) / 100;
  return pesos.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

/** Formato compacto usado en tarjetas de producto: "$89.900". */
export function centsToPlainCOP(cents: number): string {
  const pesos = Math.round(cents) / 100;
  return `$${pesos.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}
