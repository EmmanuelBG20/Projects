"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import Link from "next/link";
import { createReviewAction } from "@/actions/review.actions";
import { useToast } from "@/components/ui/Toast";

export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  if (status !== "authenticated") {
    return (
      <p className="text-sm text-neutral-400">
        <Link href="/iniciar-sesion" className="text-racing-orange hover:underline">
          Inicia sesión
        </Link>{" "}
        para dejar tu opinión sobre este producto.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createReviewAction({ productId, rating, comment });
    setLoading(false);

    if (!result.success) {
      push(result.error ?? "No se pudo enviar tu reseña", "error");
      return;
    }
    push("¡Gracias por tu opinión!", "success");
    setComment("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5">
      <p className="label-field">Tu calificación</p>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrellas`}>
            <Star size={22} className={n <= rating ? "fill-racing-orange text-racing-orange" : "text-neutral-600"} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos tu experiencia con este producto..."
        required
        minLength={5}
        maxLength={500}
        rows={3}
        className="input-field"
      />
      <button type="submit" disabled={loading} className="btn-primary mt-3">
        {loading ? "Enviando..." : "Publicar reseña"}
      </button>
    </form>
  );
}
