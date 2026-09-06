"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { createReviewAction } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId, canReview }: { productId: string; canReview: boolean }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  if (!canReview) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="underline">
          Inicia sesión
        </Link>{" "}
        para dejar una reseña de este producto.
      </p>
    );
  }

  if (submitted) {
    return <p className="text-sm text-success">¡Gracias! Tu reseña fue publicada.</p>;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createReviewAction({ productId, rating, comment });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest">Tu calificación</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setRating(n)}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  (hovered ?? rating) >= n ? "fill-foreground text-foreground" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        required
        minLength={10}
        placeholder="¿Qué te pareció el producto?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando…" : "Publicar reseña"}
      </Button>
    </form>
  );
}
