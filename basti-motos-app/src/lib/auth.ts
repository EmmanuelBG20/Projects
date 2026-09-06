import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth";

/**
 * Instancia completa de Auth.js, usada en Server Actions, Route Handlers y
 * Server Components (todo lo que corre en Node.js, no en el Edge Runtime).
 *
 * Solo usamos Credentials (email + contraseña), por eso NO usamos el Prisma
 * Adapter de Auth.js: ese adapter está pensado para providers OAuth con
 * sesiones de base de datos, y no es necesario (ni bien soportado) junto a
 * Credentials + estrategia JWT. `authorize` consulta la tabla User
 * directamente y la sesión viaja como JWT en una cookie httpOnly.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
