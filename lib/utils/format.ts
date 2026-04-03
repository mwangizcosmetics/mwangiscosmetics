import type { CurrencyCode } from "@/lib/types/ecommerce";

const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  KES: new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }),
};

export function formatCurrency(amount: number, currency: CurrencyCode = "KES") {
  return currencyFormatters[currency].format(amount);
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatRelativeStock(stock: number) {
  if (stock <= 0) return "Out of stock";
  if (stock < 8) return `Only ${stock} left`;
  return "In stock";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatEtaRange(
  etaMinValue?: number | null,
  etaMaxValue?: number | null,
  etaUnit?: "hours" | "days" | null,
) {
  if (!etaMinValue || !etaMaxValue || !etaUnit) {
    return "ETA unavailable";
  }

  const unitLabel =
    etaUnit === "hours"
      ? etaMaxValue === 1
        ? "hour"
        : "hours"
      : etaMaxValue === 1
        ? "day"
        : "days";

  return `${etaMinValue}-${etaMaxValue} ${unitLabel}`;
}
