"use client";

import { useState } from "react";
import { MapPin, Plus, Tag, ShieldCheck } from "lucide-react";
import { createAddressAction } from "@/actions/address.actions";
import { startCheckoutAction } from "@/actions/checkout.actions";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useToast } from "@/components/ui/Toast";
import { useCartStore } from "@/store/cart-store";
import { centsToCOP } from "@/lib/money";
import type { Address } from "@prisma/client";
import type { CartLineView } from "@/types";

export function CheckoutForm({
  addresses,
  lines,
  subtotalCents,
}: {
  addresses: Address[];
  lines: CartLineView[];
  subtotalCents: number;
}) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const clearCartStore = useCartStore((s) => s.clear);

  async function handlePay() {
    setLoading(true);

    const addressId = selectedAddressId;

    if (showNewAddress) {
      // El formulario de nueva dirección se envía primero; ver handleNewAddress.
      setLoading(false);
      push("Guarda la dirección antes de continuar.", "info");
      return;
    }

    if (!addressId) {
      setLoading(false);
      push("Selecciona una dirección de envío.", "error");
      return;
    }

    const result = await startCheckoutAction({ addressId, couponCode });
    setLoading(false);

    if (!result.success || !result.checkoutUrl) {
      push(result.error ?? "No pudimos iniciar el pago", "error");
      return;
    }

    // El pedido ya se creó en el servidor (el carrito en BD quedó vacío):
    // limpiamos el espejo local para que al volver de Wompi no se re-envíen
    // estos mismos productos a mergeGuestCartAction.
    clearCartStore();
    window.location.href = result.checkoutUrl;
  }

  async function handleNewAddress(data: Parameters<typeof createAddressAction>[0]) {
    setLoading(true);
    const created = await createAddressAction(data);

    if (!created.success || !created.addressId) {
      setLoading(false);
      push(created.error ?? "No se pudo guardar la dirección", "error");
      return;
    }

    const result = await startCheckoutAction({ addressId: created.addressId, couponCode });
    setLoading(false);

    if (!result.success || !result.checkoutUrl) {
      push(result.error ?? "No pudimos iniciar el pago", "error");
      return;
    }

    clearCartStore();
    window.location.href = result.checkoutUrl;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-white">
            <MapPin size={18} className="text-racing-orange" /> Dirección de envío
          </h2>

          {addresses.length > 0 && !showNewAddress && (
            <div className="space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selectedAddressId === address.id
                      ? "border-racing-orange bg-racing-orange/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-white">{address.fullName}</p>
                    <p className="text-sm text-neutral-400">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""} — {address.city}, {address.department}
                    </p>
                    <p className="text-sm text-neutral-500">{address.phone}</p>
                  </div>
                </label>
              ))}

              <button onClick={() => setShowNewAddress(true)} className="btn-ghost mt-2 w-full">
                <Plus size={16} /> Usar una nueva dirección
              </button>
            </div>
          )}

          {showNewAddress && (
            <div>
              <AddressForm onSubmit={handleNewAddress} submitLabel="Guardar y continuar al pago" loading={loading} />
              {addresses.length > 0 && (
                <button
                  onClick={() => setShowNewAddress(false)}
                  className="mt-3 text-sm text-neutral-400 hover:text-white"
                >
                  Usar una dirección guardada
                </button>
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-white">
            <Tag size={18} className="text-racing-orange" /> Cupón de descuento
          </h2>
          <div className="flex gap-3">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Código de cupón (opcional)"
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="glass-card h-fit p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-white">Resumen del pedido</h2>
        <div className="max-h-64 space-y-3 overflow-y-auto border-b border-white/10 pb-4">
          {lines.map((line) => (
            <div key={line.productId} className="flex justify-between text-sm">
              <span className="text-neutral-300">
                {line.quantity} × {line.name}
              </span>
              <span className="text-white">{centsToCOP(line.lineTotalCents)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-b border-white/10 py-4 text-neutral-300">
          <span>Subtotal</span>
          <span className="font-semibold text-white">{centsToCOP(subtotalCents)}</span>
        </div>
        <p className="py-3 text-xs text-neutral-500">
          El envío y los descuentos del cupón se calculan al confirmar tu pedido, antes de pagar en Wompi.
        </p>

        {!showNewAddress && (
          <button onClick={handlePay} disabled={loading} className="btn-primary w-full">
            {loading ? "Procesando..." : "Pagar con Wompi"}
          </button>
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck size={14} /> Pago seguro procesado por Wompi Colombia
        </p>
      </div>
    </div>
  );
}
