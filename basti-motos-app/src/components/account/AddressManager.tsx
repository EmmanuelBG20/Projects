"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import type { Address } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useToast } from "@/components/ui/Toast";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
} from "@/actions/address.actions";
import type { AddressInput } from "@/lib/validations/address";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setModalOpen(true);
  }

  async function handleSubmit(data: AddressInput) {
    setLoading(true);
    const result = editing
      ? await updateAddressAction(editing.id, data)
      : await createAddressAction(data);
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "No se pudo guardar la dirección", "error");
      return;
    }

    push("Dirección guardada", "success");
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    const result = await deleteAddressAction(id);
    if (!result.success) {
      push(result.error ?? "No se pudo eliminar", "error");
      return;
    }
    push("Dirección eliminada", "success");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="section-title mb-0">Mis direcciones</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nueva dirección
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="glass-card p-6 text-neutral-400">Aún no tienes direcciones guardadas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="glass-card p-5">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-racing-orange" />
                  <p className="font-semibold text-white">{address.fullName}</p>
                </div>
                {address.isDefault && (
                  <span className="rounded-full bg-racing-orange/15 px-2 py-0.5 text-xs text-racing-orange">
                    Predeterminada
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""} — {address.city}, {address.department}
              </p>
              <p className="text-sm text-neutral-500">{address.phone}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(address)} className="btn-secondary flex-1 py-2 text-sm">
                  <Pencil size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="rounded-lg border border-white/10 p-2 text-neutral-400 hover:border-racing-red hover:text-racing-red"
                  aria-label="Eliminar dirección"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar dirección" : "Nueva dirección"}>
        <AddressForm
          defaultValues={
            editing
              ? {
                  fullName: editing.fullName,
                  phone: editing.phone,
                  line1: editing.line1,
                  line2: editing.line2 ?? "",
                  city: editing.city,
                  department: editing.department,
                  isDefault: editing.isDefault,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel={editing ? "Guardar cambios" : "Agregar dirección"}
        />
      </Modal>
    </div>
  );
}
