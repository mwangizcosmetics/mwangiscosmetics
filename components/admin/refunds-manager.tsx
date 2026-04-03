"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import type { RefundRequest } from "@/lib/types/ecommerce";
import { formatShortDate } from "@/lib/utils/format";

const refundStatuses: RefundRequest["status"][] = [
  "requested",
  "under_review",
  "approved",
  "declined",
  "refunded",
];

export function RefundsManager() {
  const refunds = useCommerceStore((state) => state.refunds);
  const orders = useCommerceStore((state) => state.orders);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const updateRefund = useCommerceStore((state) => state.updateRefund);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<RefundRequest["status"] | "all">("all");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const filteredRefunds = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return refunds
      .filter((refund) => {
        const statusMatch = statusFilter === "all" ? true : refund.status === statusFilter;
        const order = orders.find((item) => item.id === refund.orderId);
        const queryMatch = query
          ? refund.reason.toLowerCase().includes(query) ||
            refund.status.toLowerCase().includes(query) ||
            order?.orderNumber.toLowerCase().includes(query)
          : true;

        return statusMatch && queryMatch;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, refunds, searchValue, statusFilter]);

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Refunds</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading refund data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Refund Requests</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Review requests, set status, and capture admin notes.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search refunds..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RefundRequest["status"] | "all")}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {refundStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredRefunds.length ? (
          filteredRefunds.map((refund) => {
            const order = orders.find((item) => item.id === refund.orderId);
            const noteDraft = adminNotes[refund.id] ?? refund.adminNote ?? "";

            return (
              <article
                key={refund.id}
                className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Order #{order?.orderNumber ?? refund.orderId}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      Requested {formatShortDate(refund.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--brand-100)] px-2.5 py-1 text-xs font-medium text-[var(--brand-900)]">
                    {refund.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  <p>
                    <span className="font-medium text-[var(--foreground)]">Reason:</span> {refund.reason}
                  </p>
                  {refund.note ? (
                    <p className="mt-1">
                      <span className="font-medium text-[var(--foreground)]">Customer note:</span> {refund.note}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-[220px_1fr_auto]">
                  <Select
                    value={refund.status}
                    onValueChange={(value) => {
                      const result = updateRefund(
                        refund.id,
                        value as RefundRequest["status"],
                        noteDraft,
                      );
                      if (!result.ok) {
                        toast.error(result.message ?? "Unable to update refund.");
                        return;
                      }
                      toast.success("Refund status updated.");
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refundStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={noteDraft}
                    onChange={(event) =>
                      setAdminNotes((state) => ({ ...state, [refund.id]: event.target.value }))
                    }
                    rows={2}
                    placeholder="Admin note (optional)"
                  />
                  <Button
                    type="button"
                    className="h-10 rounded-xl"
                    onClick={() => {
                      const result = updateRefund(refund.id, refund.status, noteDraft);
                      if (!result.ok) {
                        toast.error(result.message ?? "Unable to save note.");
                        return;
                      }
                      toast.success("Admin note saved.");
                    }}
                  >
                    Save Note
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)] p-6 text-center text-sm text-[var(--foreground-muted)]">
            No refund requests found.
          </div>
        )}
      </div>
    </section>
  );
}
