import { Star } from "lucide-react";
import { ReviewForm } from "@/components/product/review-form";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";

interface ReviewDTO {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { name: string };
}

export function ReviewsSection({
  productId,
  avgRating,
  reviews,
  canReview,
}: {
  productId: string;
  avgRating: number;
  reviews: ReviewDTO[];
  canReview: boolean;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-medium">{avgRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn("h-4 w-4", avgRating >= n - 0.5 ? "fill-foreground text-foreground" : "text-muted-foreground")} />
              ))}
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reseñas</p>
        </div>
        <ReviewForm productId={productId} canReview={canReview} />
      </div>

      <ul className="space-y-6 divide-y divide-border">
        {reviews.length === 0 && (
          <li className="text-sm text-muted-foreground">Sé el primero en dejar una reseña.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="pt-6 first:pt-0">
            <div className="mb-1.5 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn("h-3.5 w-3.5", r.rating >= n ? "fill-foreground text-foreground" : "text-muted-foreground")} />
              ))}
              {r.isVerifiedPurchase && (
                <Badge variant="outline" className="ml-1">
                  Compra verificada
                </Badge>
              )}
            </div>
            {r.title && <p className="text-sm font-medium">{r.title}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {r.user.name} · {formatDate(r.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
