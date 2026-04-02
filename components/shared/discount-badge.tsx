import { Badge } from "@/components/ui/badge";

interface DiscountBadgeProps {
  price: number;
  compareAtPrice?: number;
}

export function DiscountBadge({ price, compareAtPrice }: DiscountBadgeProps) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return null;
  }

  const percentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);

  return <Badge variant="soft">Save {percentage}%</Badge>;
}
