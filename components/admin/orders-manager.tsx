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
  "confirmed",
  "preparing",
  "left_shop",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrdersManager() {
  const orders = useCommerceStore((state) => state.orders);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const updateOrderStatus = useCommerceStore((state) => state.updateOrderStatus);

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
          Update delivery progression and customer-facing order statuses.
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
                  {formatShortDate(order.placedAt)} • {formatCurrency(order.total, order.currency)}
                </p>
              </div>
              <OrderStatusPill status={order.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select
                value={order.status}
                onValueChange={(value) => {
                  updateOrderStatus(order.id, value as OrderStatus);
                  toast.success(`Order marked as ${orderStatusDisplay[value as OrderStatus]}.`);
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
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-xl"
                onClick={() => {
                  if (order.status === "left_shop") {
                    updateOrderStatus(order.id, "in_transit");
                    toast.success("Suggested progression applied: In Transit.");
                  } else if (order.status === "in_transit") {
                    updateOrderStatus(order.id, "out_for_delivery");
                    toast.success("Suggested progression applied: Out for Delivery.");
                  } else {
                    toast.message("No suggested auto-step for this status.");
                  }
                }}
              >
                Smart Next Step
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
