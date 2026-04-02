import Link from "next/link";

import type { Order } from "@/lib/types/ecommerce";
import { OrderStatusPill } from "@/components/shared/order-status-pill";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

export function OrderListItem({ order }: { order: Order }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">#{order.orderNumber}</p>
          <p className="text-xs text-[var(--foreground-subtle)]">Placed on {formatShortDate(order.placedAt)}</p>
        </div>
        <OrderStatusPill status={order.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-[var(--foreground-muted)]">{order.items.length} item(s)</p>
        <p className="font-semibold text-[var(--foreground)]">{formatCurrency(order.total, order.currency)}</p>
      </div>
      <div className="mt-3">
        <Link href="/orders" className="text-sm font-medium text-[var(--brand-900)] hover:text-[var(--brand-700)]">
          View details
        </Link>
      </div>
    </article>
  );
}
