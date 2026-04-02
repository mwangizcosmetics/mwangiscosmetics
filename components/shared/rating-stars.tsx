import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({ rating, reviewCount, className }: RatingStarsProps) {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <Star
            key={star}
            className={cn(
              "size-3.5",
              rating >= star ? "fill-[#f6b75c] text-[#f6b75c]" : "text-[#ddc8ad]",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[var(--foreground-muted)]">
        {rating.toFixed(1)}
        {reviewCount ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
