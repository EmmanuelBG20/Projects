"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email() });

/**
 * Demo-scope: validates and rate-limits, then logs the subscription. Wiring
 * a real list (Resend Audiences, Mailchimp, Klaviyo…) is a single call here —
 * intentionally not modeled with its own DB table since no spec entity backs it.
 */
export async function subscribeNewsletterAction(input: unknown): Promise<{ error?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Correo inválido." };

  const ip = ipFromHeaders(headers());
  const limited = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limited.success) return { error: "Demasiados intentos. Intenta más tarde." };

  console.info(`[newsletter] subscribed: ${parsed.data.email}`);
  return {};
}
