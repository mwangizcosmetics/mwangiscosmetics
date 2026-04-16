"use client";

import { MapPin, Phone, RefreshCcw, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { OrderStatusPill } from "@/components/shared/order-status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/lib/types/ecommerce";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: "KES" | "USD";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine: string;
  county: string;
  townCenter: string;
  createdAt: string;
  dispatchAgeMinutes?: number | null;
  transitAgeMinutes?: number | null;
  deliveryNote?: string;
}

interface BebaDeliveryResponse {
  ok: boolean;
  availableQueue?: DeliveryOrder[];
  claimedQueue?: DeliveryOrder[];
  error?: string;
}

export function BebaDeliveryDashboard() {
  const [availableQueue, setAvailableQueue] = useState<DeliveryOrder[]>([]);
  const [claimedQueue, setClaimedQueue] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [notesByOrderId, setNotesByOrderId] = useState<Record<string, string>>({});

  const fetchQueues = useCallback(async (options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetch("/api/beba/deliveries", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as BebaDeliveryResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to load delivery queues.");
      }
      setAvailableQueue(payload.availableQueue ?? []);
      setClaimedQueue(payload.claimedQueue ?? []);
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "Unable to load queues.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueues({ silent: true });
  }, [fetchQueues]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchQueues({ silent: true });
    }, 10000);
    return () => window.clearInterval(interval);
  }, [fetchQueues]);

  const filteredAvailable = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return availableQueue;
    }
    return availableQueue.filter((order) =>
      [order.orderNumber, order.customerName, order.customerPhone, order.townCenter]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [availableQueue, searchValue]);

  const filteredClaimed = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return claimedQueue;
    }
    return claimedQueue.filter((order) =>
      [order.orderNumber, order.customerName, order.customerPhone, order.townCenter]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [claimedQueue, searchValue]);

  const claimOrder = async (orderId: string) => {
    setActionOrderId(orderId);
    try {
      const response = await fetch(`/api/beba/deliveries/${orderId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: notesByOrderId[orderId] || undefined,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? "Unable to claim this delivery.");
        return;
      }
      toast.success("Delivery claimed. Status moved to In Transit.");
      await fetchQueues({ silent: true });
    } catch {
      toast.error("Unable to claim this delivery.");
    } finally {
      setActionOrderId(null);
    }
  };

  const updateDeliveryStatus = async (
    orderId: string,
    targetStatus: "delivered" | "delivery_failed",
  ) => {
    setActionOrderId(orderId);
    try {
      const response = await fetch(`/api/beba/deliveries/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetStatus,
          deliveryNote: notesByOrderId[orderId] || undefined,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? "Unable to update delivery.");
        return;
      }
      toast.success(
        targetStatus === "delivered"
          ? "Order marked delivered."
          : "Order marked delivery failed.",
      );
      await fetchQueues({ silent: true });
    } catch {
      toast.error("Unable to update delivery.");
    } finally {
      setActionOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">BEBA Delivery Portal</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading your queue...</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">BEBA Delivery Portal</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Claim ready orders, call customers manually, and update delivery outcomes.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-9 rounded-xl"
            onClick={() => void fetchQueues()}
            disabled={isRefreshing}
          >
            <RefreshCcw className="size-4" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              Available Queue
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {availableQueue.length}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
              My Claimed Deliveries
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {claimedQueue.length}
            </p>
          </article>
        </div>

        <div className="mt-4">
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by order/customer/location..."
            className="h-10 rounded-xl"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h3 className="text-base font-semibold text-[var(--foreground)]">Available for Claim</h3>
        {filteredAvailable.length ? (
          filteredAvailable.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">#{order.orderNumber}</p>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    {order.customerName} • {order.customerPhone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusPill status={order.status} />
                  {typeof order.dispatchAgeMinutes === "number" && order.dispatchAgeMinutes > 45 ? (
                    <Badge variant="warning">Delayed</Badge>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 grid gap-1 text-xs text-[var(--foreground-muted)]">
                <p>
                  <MapPin className="mr-1 inline size-3.5" />
                  {order.addressLine}, {order.townCenter}, {order.county}
                </p>
                <p>
                  <Phone className="mr-1 inline size-3.5" />
                  {order.customerPhone}
                </p>
                <p>
                  Order value: {formatCurrency(order.total, order.currency)} • Created{" "}
                  {formatShortDate(order.createdAt)}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                <Textarea
                  value={notesByOrderId[order.id] ?? ""}
                  onChange={(event) =>
                    setNotesByOrderId((current) => ({
                      ...current,
                      [order.id]: event.target.value,
                    }))
                  }
                  placeholder="Optional dispatch note (manual call outcome, location cue)"
                  rows={2}
                />
                <Button
                  className="h-10 rounded-xl"
                  disabled={actionOrderId === order.id}
                  onClick={() => void claimOrder(order.id)}
                >
                  Claim Delivery
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-5 text-sm text-[var(--foreground-muted)]">
            No available deliveries to claim right now.
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h3 className="text-base font-semibold text-[var(--foreground)]">My Claimed Deliveries</h3>
        {filteredClaimed.length ? (
          filteredClaimed.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">#{order.orderNumber}</p>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    {order.customerName} • {order.customerPhone}
                  </p>
                </div>
                <OrderStatusPill status={order.status} />
              </div>
              <div className="mt-2 grid gap-1 text-xs text-[var(--foreground-muted)]">
                <p>
                  <MapPin className="mr-1 inline size-3.5" />
                  {order.addressLine}, {order.townCenter}, {order.county}
                </p>
                <p>
                  <Phone className="mr-1 inline size-3.5" />
                  {order.customerPhone}
                </p>
                <p>
                  Transit age: {order.transitAgeMinutes ?? 0} min • Value{" "}
                  {formatCurrency(order.total, order.currency)}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <Textarea
                  value={notesByOrderId[order.id] ?? order.deliveryNote ?? ""}
                  onChange={(event) =>
                    setNotesByOrderId((current) => ({
                      ...current,
                      [order.id]: event.target.value,
                    }))
                  }
                  placeholder="Delivery notes (manual call result, failed reason, landmark)"
                  rows={3}
                />
                {order.status === "in_transit" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="h-10 rounded-xl"
                      disabled={actionOrderId === order.id}
                      onClick={() => void updateDeliveryStatus(order.id, "delivered")}
                    >
                      Mark Delivered
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl"
                      disabled={actionOrderId === order.id}
                      onClick={() => void updateDeliveryStatus(order.id, "delivery_failed")}
                    >
                      Mark Delivery Failed
                    </Button>
                  </div>
                ) : (
                  <p className="inline-flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
                    <Truck className="size-3.5" />
                    This delivery is already resolved.
                  </p>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-5 text-sm text-[var(--foreground-muted)]">
            You have not claimed any delivery yet.
          </div>
        )}
      </section>
    </div>
  );
}
