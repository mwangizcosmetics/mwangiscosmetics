"use client";

import Link from "next/link";
import { PackageSearch, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { Order, OrderEvent, RefundRequest } from "@/lib/types/ecommerce";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

const progressFlow = [
  "confirmed",
  "paid",
  "ready_for_dispatch",
  "in_transit",
  "delivered",
] as const;

const recoveryStatuses = new Set(["pending_payment", "payment_init_failed", "failed_payment"]);

function isRecoverableOrder(order: Order) {
  return recoveryStatuses.has(order.status) && order.paymentStatus !== "success";
}

function hasPaymentPendingOrders(orders: Order[]) {
  return orders.some((order) => isRecoverableOrder(order));
}

interface OrdersResponse {
  ok: boolean;
  orders?: Order[];
  orderEvents?: OrderEvent[];
  refunds?: RefundRequest[];
  error?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeRefundOrderId, setActiveRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundNote, setRefundNote] = useState("");

  const fetchOrders = useCallback(async (options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as OrdersResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to load orders.");
      }

      setOrders(payload.orders ?? []);
      setRefunds(payload.refunds ?? []);
      setOrderEvents(payload.orderEvents ?? []);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load orders.";
      setErrorMessage(message);
      if (!silent) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders({ silent: true });
  }, [fetchOrders]);

  useEffect(() => {
    if (!hasPaymentPendingOrders(orders)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchOrders({ silent: true });
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [fetchOrders, orders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    [orders],
  );

  if (isLoading) {
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
        description="Track payment and delivery progress and request refunds where eligible."
      />

      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => void fetchOrders()}
          disabled={isRefreshing}
        >
          <RefreshCcw className="size-4" />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-[#f8ccd2] bg-[#fff2f4] p-4 text-sm text-[#8b1c2c]">
          {errorMessage}
        </div>
      ) : null}

      {!sortedOrders.length ? (
        <article className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">No orders yet</p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Your confirmed orders will appear here once checkout is completed.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </article>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order) => {
            const refund = refunds.find((item) => item.orderId === order.id);
            const events = getOrderEventsForOrder(orderEvents, order.id).slice(0, 4);
            const statusIndex = progressFlow.indexOf(
              order.status as (typeof progressFlow)[number],
            );
            const retryEligible = isRecoverableOrder(order);

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

                <div className="mt-4 grid gap-3 text-sm text-[var(--foreground-muted)] sm:grid-cols-4">
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
                        ? `${order.deliverySnapshot.townCenter} - ${order.deliverySnapshot.etaText}`
                        : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                      Payment
                    </p>
                    <p className="mt-1 font-medium capitalize text-[var(--foreground)]">
                      {(order.paymentStatus ?? "pending").replaceAll("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    Delivery Progress
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
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
                  {order.status === "payment_init_failed" || order.status === "failed_payment" ? (
                    <p className="text-xs font-medium text-[#a11f2f]">
                      Payment is incomplete for this order. Retry payment to continue fulfillment.
                    </p>
                  ) : null}
                  {order.status === "delivery_failed" ? (
                    <p className="text-xs font-medium text-[#a11f2f]">
                      Delivery attempt failed. Our team will follow up manually.
                    </p>
                  ) : null}
                  {order.status === "returned" ? (
                    <p className="text-xs font-medium text-[var(--foreground-muted)]">
                      This order has been returned to the shop.
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                    Status Events
                  </p>
                  <div className="mt-2 space-y-2">
                    {events.length ? (
                      events.map((event) => (
                        <div key={event.id} className="text-sm text-[var(--foreground-muted)]">
                          <p className="font-medium text-[var(--foreground)]">{event.message}</p>
                          <p className="text-xs text-[var(--foreground-subtle)]">
                            {formatShortDate(event.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--foreground-muted)]">No events yet.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand-900)]">
                    <PackageSearch className="size-4" />
                    Delivery status: {orderStatusDisplay[order.status]}
                  </div>

                  {retryEligible ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={retryingOrderId === order.id}
                      onClick={async () => {
                        setRetryingOrderId(order.id);
                        try {
                          const response = await fetch(`/api/orders/${order.id}/retry-payment`, {
                            method: "POST",
                          });
                          const payload = (await response.json()) as {
                            ok: boolean;
                            error?: string;
                            customerMessage?: string;
                          };
                          if (!response.ok || !payload.ok) {
                            toast.error(payload.error ?? "Unable to retry payment.");
                            return;
                          }
                          toast.success(
                            payload.customerMessage ??
                              "STK push sent again. Complete payment on your phone.",
                          );
                          void fetchOrders({ silent: true });
                        } catch {
                          toast.error("Unable to retry payment right now.");
                        } finally {
                          setRetryingOrderId(null);
                        }
                      }}
                    >
                      {retryingOrderId === order.id ? "Retrying..." : "Retry Payment"}
                    </Button>
                  ) : null}

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
                            onClick={async () => {
                              if (!refundReason.trim()) {
                                toast.error("Refund reason is required.");
                                return;
                              }

                              try {
                                const response = await fetch(`/api/orders/${order.id}/refund`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    reason: refundReason.trim(),
                                    note: refundNote.trim() || undefined,
                                  }),
                                });
                                const payload = (await response.json()) as {
                                  ok: boolean;
                                  error?: string;
                                };
                                if (!response.ok || !payload.ok) {
                                  toast.error(payload.error ?? "Unable to submit refund request.");
                                  return;
                                }

                                toast.success("Refund request submitted.");
                                setActiveRefundOrderId(null);
                                setRefundReason("");
                                setRefundNote("");
                                void fetchOrders({ silent: true });
                              } catch {
                                toast.error("Unable to submit refund request.");
                              }
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
      )}
    </SiteContainer>
  );
}
