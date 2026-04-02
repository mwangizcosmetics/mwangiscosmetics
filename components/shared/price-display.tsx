import type { CurrencyCode } from "@/lib/types/ecommerce";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  currency?: CurrencyCode;
  className?: string;
}

export function PriceDisplay({ price, compareAtPrice, currency = "KES", className }: PriceDisplayProps) {
  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > price);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-semibold text-[var(--foreground)] sm:text-base">{formatCurrency(price, currency)}</span>
      {hasDiscount ? <span className="text-xs text-[var(--foreground-subtle)] line-through">{formatCurrency(compareAtPrice as number, currency)}</span> : null}
    </div>
  );
}
