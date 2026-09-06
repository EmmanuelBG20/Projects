import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/constants";

/**
 * Edge-safe slice of the Auth.js config. Next.js middleware runs on the Edge
 * runtime, which cannot load the Prisma Node-API query engine — so this file
 * (used by middleware.ts) must never import `@/lib/prisma` or `bcryptjs`.
 * The Node-only pieces (the Credentials provider's `authorize`, which does
 * need Prisma) live in `@/lib/auth.ts`, which extends this config.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = ((user as { role?: Role }).role ?? "CUSTOMER") as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
