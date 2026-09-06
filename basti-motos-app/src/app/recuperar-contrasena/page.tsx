"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/Input";

export default function RecuperarContrasenaPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    await forgotPasswordAction(data);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="container-app flex justify-center py-16">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <KeyRound className="mx-auto mb-3 text-racing-orange" size={32} />
          <h1 className="font-display text-2xl font-bold text-white">Recupera tu contraseña</h1>
          <p className="mt-1 text-sm text-neutral-400">Te enviaremos un enlace para crear una nueva.</p>
        </div>

        {sent ? (
          <p className="rounded-lg bg-neon-green/10 p-4 text-center text-sm text-neon-green">
            Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Correo electrónico" type="email" error={errors.email?.message} {...register("email")} />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-400">
          <Link href="/iniciar-sesion" className="text-racing-orange hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
