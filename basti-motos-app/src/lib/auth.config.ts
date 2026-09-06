import type { NextAuthConfig } from "next-auth";

/**
 * Configuración "compatible con Edge": nada de Prisma ni bcrypt aquí. El
 * middleware (que corre en el Edge Runtime de Next.js) importa SOLO este
 * archivo para leer/verificar la cookie de sesión JWT. La lógica real de
 * login (consultar la base de datos y comparar contraseñas) vive en
 * `auth.ts`, que extiende esta configuración únicamente en el resto del
 * servidor (Server Actions, Route Handlers, Server Components), donde sí se
 * ejecuta en Node.js.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/iniciar-sesion",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: "CUSTOMER" | "ADMIN" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
