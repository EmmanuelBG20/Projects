"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { placeOrderAction } from "@/lib/actions/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS_CO, PAYMENT_PROVIDER_LABELS } from "@/lib/constants";
import { analytics } from "@/lib/analytics";

const PAYMENT_METHODS = [
  { id: "WOMPI", description: "Tarjeta, PSE y Nequi" },
  { id: "MERCADOPAGO", description: "Tarjeta y saldo Mercado Pago" },
  { id: "STRIPE", description: "Tarjetas internacionales" },
] as const;

export function CheckoutForm({
  configuredProviders,
  defaultEmail,
  cartValue,
  cartItemsForAnalytics,
}: {
  configuredProviders: Record<string, boolean>;
  defaultEmail?: string;
  cartValue: number;
  cartItemsForAnalytics: { item_id: string; item_name: string; price: number; quantity: number }[];
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: defaultEmail ?? "", paymentMethod: "WOMPI" },
  });

  const paymentMethod = watch("paymentMethod");
  const anySandbox = !configuredProviders[paymentMethod];

  async function onSubmit(data: CheckoutInput) {
    setSubmitError(null);
    analytics.beginCheckout(cartItemsForAnalytics, cartValue);
    const res = await placeOrderAction(data);
    if (res.error) {
      setSubmitError(res.error);
      toast.error(res.error);
      return;
    }
    if (res.redirectUrl) {
      router.push(res.redirectUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest">Contacto</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2 sm:col-span-1">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="col-span-2 space-y-2 sm:col-span-1">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register("phone")} placeholder="+573001234567" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest">Dirección de envío</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="line1">Dirección</Label>
            <Input id="line1" {...register("line1")} placeholder="Calle 10 # 20-30" />
            {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="line2">Información adicional (opcional)</Label>
            <Input id="line2" {...register("line2")} placeholder="Apto, torre, referencia…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Select onValueChange={(v) => setValue("department", v, { shouldValidate: true })}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS_CO.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Código postal (opcional)</Label>
            <Input id="postalCode" {...register("postalCode")} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Observaciones (opcional)</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Instrucciones de entrega…" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest">Método de pago</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => setValue("paymentMethod", v as CheckoutInput["paymentMethod"])}
        >
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className="flex cursor-pointer items-center justify-between border border-input px-4 py-3 has-[[data-state=checked]]:border-foreground"
            >
              <span className="flex items-center gap-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <span>
                  <span className="block text-sm font-medium">{PAYMENT_PROVIDER_LABELS[method.id]}</span>
                  <span className="block text-xs text-muted-foreground">{method.description}</span>
                </span>
              </span>
              {!configuredProviders[method.id] && (
                <span className="text-[10px] font-medium uppercase tracking-widest text-rust">Sandbox</span>
              )}
            </label>
          ))}
        </RadioGroup>
        {anySandbox && (
          <p className="mt-3 text-xs text-muted-foreground">
            Este proveedor no tiene credenciales configuradas en este entorno, así que la compra se procesará en{" "}
            <strong>modo sandbox</strong>: el pago se aprueba automáticamente y no se realiza ningún cargo real.
          </p>
        )}
      </section>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Procesando…" : "Pagar pedido"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Nunca almacenamos los datos de tu tarjeta. El pago se procesa directamente con el proveedor seleccionado.
      </p>
    </form>
  );
}
