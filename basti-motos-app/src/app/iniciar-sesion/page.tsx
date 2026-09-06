"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();

  const verificacion = searchParams.get("verificacion");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/mi-cuenta";

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const result = await loginAction(data);
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "No pudimos iniciar sesión", "error");
      return;
    }
    push("¡Bienvenido de nuevo!", "success");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="glass-card w-full max-w-md p-8">
      <div className="mb-6 text-center">
        <LogIn className="mx-auto mb-3 text-racing-orange" size={32} />
        <h1 className="font-display text-2xl font-bold text-white">Inicia sesión</h1>
        <p className="mt-1 text-sm text-neutral-400">Accede a tu cuenta de BASTI MOTOS</p>
      </div>

      {verificacion === "exitosa" && (
        <p className="mb-4 rounded-lg bg-neon-green/10 p-3 text-sm text-neon-green">
          Tu correo fue verificado correctamente.
        </p>
      )}
      {verificacion === "invalida" && (
        <p className="mb-4 rounded-lg bg-racing-red/10 p-3 text-sm text-racing-red">
          El enlace de verificación no es válido o ya expiró.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right">
          <Link href="/recuperar-contrasena" className="text-sm text-racing-orange hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-racing-orange hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}

export default function IniciarSesionPage() {
  return (
    <div className="container-app flex justify-center py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
