"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPasswordAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();
  const { push } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: ResetPasswordInput) {
    setLoading(true);
    const result = await resetPasswordAction(data);
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "No se pudo cambiar la contraseña", "error");
      return;
    }
    push("Contraseña actualizada. Ya puedes iniciar sesión.", "success");
    router.push("/iniciar-sesion");
  }

  if (!token) {
    return (
      <p className="glass-card p-6 text-center text-neutral-300">
        Este enlace no es válido. Solicita uno nuevo desde{" "}
        <a href="/recuperar-contrasena" className="text-racing-orange hover:underline">
          recuperar contraseña
        </a>
        .
      </p>
    );
  }

  return (
    <div className="glass-card w-full max-w-md p-8">
      <div className="mb-6 text-center">
        <Lock className="mx-auto mb-3 text-racing-orange" size={32} />
        <h1 className="font-display text-2xl font-bold text-white">Crea una nueva contraseña</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <Input label="Nueva contraseña" type="password" error={errors.password?.message} {...register("password")} />
        <Input
          label="Confirmar contraseña"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}

export default function NuevaContrasenaPage() {
  return (
    <div className="container-app flex justify-center py-16">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
