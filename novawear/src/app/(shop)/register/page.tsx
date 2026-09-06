import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-2xl tracking-wide">
          NOVAWEAR
        </Link>
        <h1 className="mb-8 text-center font-display text-2xl">Crea tu cuenta</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
