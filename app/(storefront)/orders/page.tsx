import { PackageSearch } from "lucide-react";

import { sampleOrders } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { OrderStatusPill } from "@/components/shared/order-status-pill";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

export default function OrdersPage() {
  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Orders"
        title="Order History"
        description="Track delivery progress and review your previous purchases."
      />
      <div className="space-y-3">
        {sampleOrders.map((order) => (
          <article key={order.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">#{order.orderNumber}</p>
                <p className="text-xs text-[var(--foreground-subtle)]">Placed on {formatShortDate(order.placedAt)}</p>
              </div>
              <OrderStatusPill status={order.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--foreground-muted)] sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Items</p>
                <p className="mt-1 font-medium text-[var(--foreground)]">{order.items.length} item(s)</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Total</p>
                <p className="mt-1 font-medium text-[var(--foreground)]">{formatCurrency(order.total, order.currency)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">ETA</p>
                <p className="mt-1 font-medium text-[var(--foreground)]">
                  {order.estimatedDelivery ? formatShortDate(order.estimatedDelivery) : "Pending"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--brand-900)]">
              <PackageSearch className="size-4" />
              Track package updates
            </div>
          </article>
        ))}
      </div>
    </SiteContainer>
  );
}
