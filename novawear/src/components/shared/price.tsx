import { cn, discountPercentage, formatPrice } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  size = "default",
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const discount = discountPercentage(price, compareAtPrice);

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-medium tabular-nums",
          size === "sm" && "text-sm",
          size === "default" && "text-base",
          size === "lg" && "text-2xl",
        )}
      >
        {formatPrice(price)}
      </span>
      {discount > 0 && (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {formatPrice(compareAtPrice!)}
          </span>
          <span className="text-xs font-medium text-rust">-{discount}%</span>
        </>
      )}
    </div>
  );
}
