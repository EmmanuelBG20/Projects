import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-2xl tracking-wide">
          NOVAWEAR
        </Link>
        <h1 className="mb-8 text-center font-display text-2xl">Bienvenido de nuevo</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
