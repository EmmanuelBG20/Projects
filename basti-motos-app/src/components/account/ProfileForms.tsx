"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateProfileAction, changePasswordAction } from "@/actions/account.actions";

export function ProfileNameForm({ initialName }: { initialName: string }) {
  const { register, handleSubmit } = useForm<{ name: string }>({ defaultValues: { name: initialName } });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function onSubmit(data: { name: string }) {
    setLoading(true);
    const result = await updateProfileAction(data);
    setLoading(false);
    push(result.success ? "Perfil actualizado" : result.error ?? "Error", result.success ? "success" : "error");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 p-6">
      <h2 className="font-display font-bold text-white">Datos personales</h2>
      <Input label="Nombre completo" {...register("name", { required: true })} />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}

type PasswordFormValues = { currentPassword: string; newPassword: string; confirmPassword: string };

export function ChangePasswordForm() {
  const { register, handleSubmit, reset } = useForm<PasswordFormValues>();
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function onSubmit(data: PasswordFormValues) {
    setLoading(true);
    const result = await changePasswordAction(data);
    setLoading(false);
    if (result.success) {
      push("Contraseña actualizada", "success");
      reset();
    } else {
      push(result.error ?? "Error", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card mt-6 space-y-4 p-6">
      <h2 className="font-display font-bold text-white">Cambiar contraseña</h2>
      <Input label="Contraseña actual" type="password" {...register("currentPassword", { required: true })} />
      <Input label="Nueva contraseña" type="password" {...register("newPassword", { required: true, minLength: 8 })} />
      <Input label="Confirmar nueva contraseña" type="password" {...register("confirmPassword", { required: true })} />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Actualizando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
