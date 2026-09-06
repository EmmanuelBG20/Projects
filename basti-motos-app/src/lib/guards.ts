import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new UnauthorizedError("Requiere permisos de administrador.");
  }
  return session.user;
}
