import { Star, StarHalf } from "lucide-react";

export function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Calificación ${rating.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return <Star key={i} size={size} className="fill-racing-orange text-racing-orange" />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} size={size} className="fill-racing-orange text-racing-orange" />;
        }
        return <Star key={i} size={size} className="text-neutral-600" />;
      })}
    </div>
  );
}
