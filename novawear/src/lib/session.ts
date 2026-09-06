import "server-only";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/constants";

export class AuthError extends Error {
  constructor(message = "No autenticado") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Throws if there is no signed-in user. Use in server actions / route handlers. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return user;
}

/**
 * Throws unless the signed-in user has one of `roles`. This is the backend
 * authorization boundary — the frontend hides admin UI for UX only, but every
 * mutating admin action re-checks this server-side.
 */
export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN", "MANAGER"]);
}
