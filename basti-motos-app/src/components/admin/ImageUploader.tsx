"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, ImagePlus } from "lucide-react";
import { addProductImageAction, deleteProductImageAction } from "@/actions/product.actions";
import { useToast } from "@/components/ui/Toast";
import type { ProductImage } from "@prisma/client";

export function ImageUploader({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      if (!signRes.ok) {
        const body = await signRes.json();
        throw new Error(body.error ?? "No se pudo firmar la subida");
      }
      const { timestamp, folder, signature, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Cloudinary rechazó la imagen");
      const uploaded = await uploadRes.json();

      await addProductImageAction(productId, uploaded.secure_url, uploaded.public_id);
      push("Imagen agregada", "success");
      router.refresh();
    } catch (error) {
      push(error instanceof Error ? error.message : "Error al subir la imagen", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    const result = await deleteProductImageAction(imageId);
    if (!result.success) {
      push(result.error ?? "No se pudo eliminar", "error");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Eliminar imagen"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/20 text-neutral-400 hover:border-racing-orange hover:text-racing-orange">
          {uploading ? <Upload size={20} className="animate-pulse" /> : <ImagePlus size={20} />}
          <span className="text-xs">{uploading ? "Subiendo..." : "Agregar"}</span>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      <p className="text-xs text-neutral-500">
        Requiere las variables CLOUDINARY_* configuradas en el servidor.
      </p>
    </div>
  );
}
