import Image from "next/image";

import { formatCurrency } from "@/lib/utils/format";

interface CheckoutSummaryCardProps {
  items: Array<{
    productId: string;
    quantity: number;
    lineTotal: number;
    product: {
      name: string;
      images: { url: string; alt: string }[];
    };
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function CheckoutSummaryCard({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: CheckoutSummaryCardProps) {
  return (
    <aside className="sticky top-24 space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Checkout Summary</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative size-14 overflow-hidden rounded-xl bg-[var(--brand-50)]">
              <Image src={item.product.images[0].url} alt={item.product.images[0].alt} fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.product.name}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">{formatCurrency(item.lineTotal)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--foreground-muted)]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-[var(--foreground)]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="text-[var(--foreground)]">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span className="text-[var(--foreground)]">{formatCurrency(tax)}</span>
        </div>
        <div className="flex items-center justify-between pt-1 text-base font-semibold text-[var(--foreground)]">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </aside>
  );
}
