/**
 * Rate limiter simple en memoria, ventana deslizante.
 *
 * Suficiente para un despliegue de un solo proceso o para desarrollo local.
 * En Vercel serverless cada instancia tiene su propia memoria, así que el
 * límite real efectivo puede ser mayor al configurado bajo mucho tráfico
 * concurrente. Para producción con múltiples instancias, reemplaza el Map
 * de abajo por Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`),
 * manteniendo la misma firma de `checkRateLimit`.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Presets usados en las rutas sensibles de autenticación. */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60_000 },
  register: { limit: 5, windowMs: 60 * 60_000 },
  passwordReset: { limit: 3, windowMs: 15 * 60_000 },
} as const;
