"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { OrderStatusPill } from "@/components/shared/order-status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatusDisplay } from "@/lib/constants/shop";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import type { OrderStatus } from "@/lib/types/ecommerce";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

const operationalStatuses: OrderStatus[] = [
  "pending_payment",
  "paid",
  "confirmed",
  "ready_for_dispatch",
  "in_transit",
  "delivery_failed",
  "returned",
  "delivered",
  "cancelled",
  "failed_payment",
];

export function OrdersManager() {
  const orders = useCommerceStore((state) => state.orders);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const updateOrderStatus = useCommerceStore((state) => state.updateOrderStatus);
  const confirmOrderPayment = useCommerceStore((state) => state.confirmOrderPayment);

  const [searchValue, setSearchValue] = useState("");

  const filteredOrders = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return [...orders]
      .filter((order) => {
        if (!query) return true;
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.status.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [orders, searchValue]);

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Orders</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading order data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Order Management</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Confirm payments and manage core order states. Dispatch and delivery flow now runs from Delivery Ops.
        </p>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by order number or status..."
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-[var(--border)] bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">#{order.orderNumber}</p>
                <p className="text-xs text-[var(--foreground-subtle)]">
                  {formatShortDate(order.placedAt)} - {formatCurrency(order.total, order.currency)}
                </p>
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Payment: {order.paymentStatus ?? "pending"}
                  {order.paymentReference ? ` (${order.paymentReference})` : ""}
                </p>
              </div>
              <OrderStatusPill status={order.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select
                value={order.status}
                onValueChange={(value) => {
                  const nextStatus = value as OrderStatus;
                  if (nextStatus === "paid") {
                    const paymentResult = confirmOrderPayment(order.id, {
                      paymentReference: `ADMIN-${order.orderNumber}`,
                    });
                    if (!paymentResult.ok) {
                      toast.error(paymentResult.message ?? "Unable to confirm payment.");
                      return;
                    }
                    toast.success("Payment confirmed and stock deducted.");
                    return;
                  }

                  const result = updateOrderStatus(order.id, nextStatus);
                  if (!result.ok) {
                    toast.error("Order status requires payment confirmation first.");
                    return;
                  }
                  toast.success(`Order marked as ${orderStatusDisplay[nextStatus]}.`);
                }}
              >
                <SelectTrigger className="h-9 w-56 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operationalStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {orderStatusDisplay[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(order.status === "pending_payment" || order.paymentStatus !== "success") ? (
                <Button
                  size="sm"
                  className="h-9 rounded-xl"
                  onClick={() => {
                    const result = confirmOrderPayment(order.id, {
                      paymentReference: `ADMIN-${order.orderNumber}`,
                    });
                    if (!result.ok) {
                      toast.error(result.message ?? "Unable to confirm payment.");
                      return;
                    }
                    toast.success("Payment confirmed and stock deducted.");
                  }}
                >
                  Mark as Paid + Deduct Stock
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
