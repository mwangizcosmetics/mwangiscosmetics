"use client";

import { Clock3, RefreshCcw, Search, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { OrderStatusPill } from "@/components/shared/order-status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NormalizedRole } from "@/lib/services/rbac";
import type { OrderStatus } from "@/lib/types/ecommerce";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

interface DeliveryOpsOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: "pending" | "success" | "failed" | "refunded";
  total: number;
  currency: "KES" | "USD";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine: string;
  county: string;
  townCenter: string;
  createdAt: string;
  readyForDispatchAt?: string;
  inTransitAt?: string;
  dispatchAgeMinutes?: number | null;
  transitAgeMinutes?: number | null;
  dispatchNote?: string;
  deliveryNote?: string;
  deliveryAgentName?: string;
  recentEvents: Array<{
    id: string;
    eventType: string;
    message: string;
    createdAt: string;
  }>;
}

interface DeliveryOpsManagerProps {
  role: NormalizedRole;
}

interface DeliveryOrdersResponse {
  ok: boolean;
  orders?: DeliveryOpsOrder[];
  error?: string;
}

export function DeliveryOpsManager({ role }: DeliveryOpsManagerProps) {
  const [orders, setOrders] = useState<DeliveryOpsOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadOrders = useCallback(async (options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetch("/api/admin/delivery/orders", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as DeliveryOrdersResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to load delivery operations.");
      }
      setOrders(payload.orders ?? []);
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "Unable to load delivery orders.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders({ silent: true });
  }, [loadOrders]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadOrders({ silent: true });
    }, 12000);
    return () => window.clearInterval(interval);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
        order.county,
        order.townCenter,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, searchValue, statusFilter]);

  const delayedDispatchOrders = orders.filter(
    (order) =>
      order.status === "ready_for_dispatch" &&
      typeof order.dispatchAgeMinutes === "number" &&
      order.dispatchAgeMinutes >= 45,
  );
  const delayedTransitOrders = orders.filter(
    (order) =>
      order.status === "in_transit" &&
      typeof order.transitAgeMinutes === "number" &&
      order.transitAgeMinutes >= 180,
  );

  const markReady = async (orderId: string) => {
    setActionOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/delivery/orders/${orderId}/ready`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? "Failed to mark order ready for dispatch.");
        return;
      }

      toast.success("Order moved to Ready for Dispatch.");
      await loadOrders({ silent: true });
    } catch {
      toast.error("Failed to mark order ready for dispatch.");
    } finally {
      setActionOrderId(null);
    }
  };

  const setOutcome = async (
    orderId: string,
    targetStatus: "delivered" | "delivery_failed" | "returned",
  ) => {
    setActionOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/delivery/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetStatus }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? "Status update failed.");
        return;
      }
      toast.success("Delivery status updated.");
      await loadOrders({ silent: true });
    } catch {
      toast.error("Status update failed.");
    } finally {
      setActionOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Delivery Operations</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading dispatch board...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Delivery Operations</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Staff dispatches paid orders. BEBA claims from ready queue and updates delivery.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-9 rounded-xl"
          onClick={() => void loadOrders()}
          disabled={isRefreshing}
        >
          <RefreshCcw className="size-4" />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-[var(--border)] bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Ready Queue
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {orders.filter((order) => order.status === "ready_for_dispatch").length}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Dispatch Delays
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {delayedDispatchOrders.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Transit Delays
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {delayedTransitOrders.length}
          </p>
        </article>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search order, customer, location..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="ready_for_dispatch">Ready for Dispatch</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="delivery_failed">Delivery Failed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredOrders.length ? (
          filteredOrders.map((order) => {
            const canDispatch =
              (order.status === "paid" || order.status === "confirmed") &&
              order.paymentStatus === "success";
            const isOverDispatchSla =
              order.status === "ready_for_dispatch" &&
              typeof order.dispatchAgeMinutes === "number" &&
              order.dispatchAgeMinutes >= 45;
            const isOverTransitSla =
              order.status === "in_transit" &&
              typeof order.transitAgeMinutes === "number" &&
              order.transitAgeMinutes >= 180;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {order.customerName} • {order.customerPhone}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {order.townCenter}, {order.county} • {formatCurrency(order.total, order.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusPill status={order.status} />
                    {isOverDispatchSla || isOverTransitSla ? (
                      <Badge variant="warning">Delayed</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 grid gap-1 text-xs text-[var(--foreground-muted)] sm:grid-cols-2">
                  <p>Created: {formatShortDate(order.createdAt)}</p>
                  <p>Payment: {order.paymentStatus}</p>
                  <p>Address: {order.addressLine}</p>
                  <p>Assigned BEBA: {order.deliveryAgentName ?? "Unassigned"}</p>
                  {typeof order.dispatchAgeMinutes === "number" ? (
                    <p className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      Ready age: {order.dispatchAgeMinutes} min
                    </p>
                  ) : null}
                  {typeof order.transitAgeMinutes === "number" ? (
                    <p className="inline-flex items-center gap-1">
                      <Truck className="size-3.5" />
                      Transit age: {order.transitAgeMinutes} min
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {canDispatch ? (
                    <Button
                      size="sm"
                      className="h-9 rounded-xl"
                      disabled={actionOrderId === order.id}
                      onClick={() => void markReady(order.id)}
                    >
                      Mark Ready for Dispatch
                    </Button>
                  ) : null}

                  {role === "super_admin" &&
                  (order.status === "in_transit" ||
                    order.status === "delivery_failed" ||
                    order.status === "delivered") ? (
                    <>
                      {order.status === "in_transit" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl"
                            disabled={actionOrderId === order.id}
                            onClick={() => void setOutcome(order.id, "delivered")}
                          >
                            Force Delivered
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl"
                            disabled={actionOrderId === order.id}
                            onClick={() => void setOutcome(order.id, "delivery_failed")}
                          >
                            Mark Delivery Failed
                          </Button>
                        </>
                      ) : null}
                      {(order.status === "delivery_failed" || order.status === "delivered") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-xl"
                          disabled={actionOrderId === order.id}
                          onClick={() => void setOutcome(order.id, "returned")}
                        >
                          Mark Returned
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>

                {order.recentEvents.length ? (
                  <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                      Recent Events
                    </p>
                    <div className="mt-2 space-y-1">
                      {order.recentEvents.slice(0, 3).map((event) => (
                        <p key={event.id} className="text-xs text-[var(--foreground-muted)]">
                          {event.message} • {formatShortDate(event.createdAt)}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-5 text-sm text-[var(--foreground-muted)]">
            No delivery orders match the current filter.
          </div>
        )}
      </div>
    </section>
  );
}
