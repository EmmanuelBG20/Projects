"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction, loginAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function RegistroPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    const result = await registerAction(data);

    if (!result.success) {
      setLoading(false);
      push(result.error ?? "No pudimos crear tu cuenta", "error");
      return;
    }

    // Iniciamos sesión automáticamente para no pedirle al usuario que lo
    // haga dos veces justo después de registrarse.
    await loginAction({ email: data.email, password: data.password });
    setLoading(false);
    push("¡Cuenta creada! Revisa tu correo para confirmarla.", "success");
    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <div className="container-app flex justify-center py-16">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <UserPlus className="mx-auto mb-3 text-racing-orange" size={32} />
          <h1 className="font-display text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-neutral-400">Únete a la comunidad BASTI MOTOS</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre completo" error={errors.name?.message} {...register("name")} />
          <Input label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Contraseña" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <Input
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/iniciar-sesion" className="text-racing-orange hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
