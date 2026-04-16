import { Badge } from "@/components/ui/badge";

interface DiscountBadgeProps {
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
}

export function DiscountBadge({ price, compareAtPrice, discountPercent }: DiscountBadgeProps) {
  const percentage =
    typeof discountPercent === "number" && discountPercent > 0
      ? Math.round(discountPercent)
      : compareAtPrice && compareAtPrice > price
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

  if (!percentage) return null;

  return <Badge variant="soft">Save {percentage}%</Badge>;
}
