import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/lib/constants";

// Node-runtime Auth.js instance: this is the one imported by the API route
// handler and by server components/actions (never by middleware.ts).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Best-effort brute-force throttle per email.
        const limited = rateLimit(`login:${email.toLowerCase()}`, {
          limit: 5,
          windowMs: 5 * 60_000,
        });
        if (!limited.success) return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role as Role,
        };
      },
    }),
  ],
});
