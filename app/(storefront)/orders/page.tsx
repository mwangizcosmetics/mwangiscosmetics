"use client";

import { PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { OrderStatusPill } from "@/components/shared/order-status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { orderStatusDisplay } from "@/lib/constants/shop";
import {
  canRequestRefund,
  getOrderEventsForOrder,
} from "@/lib/services/commerce-selectors";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

const progressFlow = [
  "confirmed",
  "preparing",
  "left_shop",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;

export default function OrdersPage() {
  const orders = useCommerceStore((state) => state.orders);
  const refunds = useCommerceStore((state) => state.refunds);
  const orderEvents = useCommerceStore((state) => state.orderEvents);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const createRefundRequest = useCommerceStore((state) => state.createRefundRequest);

  const [activeRefundOrderId, setActiveRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundNote, setRefundNote] = useState("");

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    [orders],
  );

  if (!hasHydrated) {
    return (
      <SiteContainer className="py-6 sm:py-8">
        <SectionHeading
          eyebrow="Orders"
          title="Order History"
          description="Loading your order timeline..."
        />
      </SiteContainer>
    );
  }

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Orders"
        title="Order History"
        description="Track delivery progress and request refunds where eligible."
      />
      <div className="space-y-3">
        {sortedOrders.map((order) => {
          const refund = refunds.find((item) => item.orderId === order.id);
          const events = getOrderEventsForOrder(orderEvents, order.id).slice(0, 4);
          const statusIndex = progressFlow.indexOf(
            order.status as (typeof progressFlow)[number],
          );

          return (
            <article
              key={order.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Placed on {formatShortDate(order.placedAt)}
                  </p>
                </div>
                <OrderStatusPill status={order.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-[var(--foreground-muted)] sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    Items
                  </p>
                  <p className="mt-1 font-medium text-[var(--foreground)]">
                    {order.items.length} item(s)
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    Total
                  </p>
                  <p className="mt-1 font-medium text-[var(--foreground)]">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    Delivery
                  </p>
                  <p className="mt-1 font-medium text-[var(--foreground)]">
                    {order.deliverySnapshot
                      ? `${order.deliverySnapshot.townCenter} • ${order.deliverySnapshot.etaText}`
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                  Delivery Progress
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {progressFlow.map((status, index) => {
                    const active =
                      statusIndex >= 0 ? index <= statusIndex : order.status === status;
                    return (
                      <div
                        key={status}
                        className={`rounded-xl px-2 py-1 text-center text-[11px] font-medium ${
                          active
                            ? "bg-[var(--brand-100)] text-[var(--brand-900)]"
                            : "bg-[var(--surface-alt)] text-[var(--foreground-subtle)]"
                        }`}
                      >
                        {orderStatusDisplay[status]}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                  Status Events
                </p>
                <div className="mt-2 space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="text-sm text-[var(--foreground-muted)]">
                      <p className="font-medium text-[var(--foreground)]">{event.message}</p>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        {formatShortDate(event.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand-900)]">
                  <PackageSearch className="size-4" />
                  Delivery status: {orderStatusDisplay[order.status]}
                </div>
                {refund ? (
                  <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                    Refund: {refund.status.replaceAll("_", " ")}
                  </span>
                ) : canRequestRefund(order) ? (
                  <Sheet
                    open={activeRefundOrderId === order.id}
                    onOpenChange={(open) => {
                      setActiveRefundOrderId(open ? order.id : null);
                      if (!open) {
                        setRefundReason("");
                        setRefundNote("");
                      }
                    }}
                  >
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-full">
                        Request Refund
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="max-h-[82vh] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Refund Request</SheetTitle>
                        <SheetDescription>
                          Tell us why you want a refund for order #{order.orderNumber}.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-5 space-y-3 pb-4">
                        <Input
                          value={refundReason}
                          onChange={(event) => setRefundReason(event.target.value)}
                          placeholder="Reason (e.g. Damaged item)"
                        />
                        <Textarea
                          value={refundNote}
                          onChange={(event) => setRefundNote(event.target.value)}
                          placeholder="Optional details"
                          rows={4}
                        />
                        <Button
                          className="h-11 w-full rounded-full"
                          onClick={() => {
                            if (!refundReason.trim()) {
                              toast.error("Refund reason is required.");
                              return;
                            }

                            const result = createRefundRequest({
                              orderId: order.id,
                              userId: order.userId,
                              reason: refundReason.trim(),
                              note: refundNote.trim() || undefined,
                            });
                            if (!result.ok) {
                              toast.error(result.message ?? "Unable to submit refund request.");
                              return;
                            }

                            toast.success("Refund request submitted.");
                            setActiveRefundOrderId(null);
                            setRefundReason("");
                            setRefundNote("");
                          }}
                        >
                          Submit Refund Request
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </SiteContainer>
  );
}
