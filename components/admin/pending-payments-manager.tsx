"use client";

import { Copy, RefreshCcw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

type RecoveryState =
  | "pending_payment"
  | "payment_init_failed"
  | "payment_failed"
  | "payment_timed_out"
  | "payment_cancelled";

interface PendingPaymentRecord {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  lastPaymentAttemptAt: string;
  orderValue: number;
  currency: "KES" | "USD";
  productsAttempted: string[];
  failureReason?: string;
  retryCount: number;
  recoveryState: RecoveryState;
  paymentMethod: string;
  paymentStatus: string;
  followUpStatus: "new" | "contacted" | "archived" | "dismissed";
  followUpNotes?: string;
  contactedAt?: string;
  recoveryArchived: boolean;
}

interface PendingPaymentSummary {
  totalPendingRevenue: number;
  recoveredRevenue: number;
  recoveryConversionRate: number;
  pendingOrdersCount: number;
}

interface PendingPaymentsResponse {
  ok: boolean;
  records?: PendingPaymentRecord[];
  summary?: PendingPaymentSummary;
  error?: string;
}

const recoveryStateLabel: Record<RecoveryState, string> = {
  pending_payment: "Pending Payment",
  payment_init_failed: "Init Failed",
  payment_failed: "Payment Failed",
  payment_timed_out: "Timed Out",
  payment_cancelled: "Cancelled",
};

function recoveryStateTone(state: RecoveryState) {
  switch (state) {
    case "pending_payment":
      return "soft" as const;
    case "payment_init_failed":
    case "payment_failed":
      return "warning" as const;
    case "payment_timed_out":
    case "payment_cancelled":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function followUpTone(status: PendingPaymentRecord["followUpStatus"]) {
  switch (status) {
    case "contacted":
      return "success" as const;
    case "archived":
    case "dismissed":
      return "outline" as const;
    default:
      return "soft" as const;
  }
}

export function PendingPaymentsManager() {
  const [records, setRecords] = useState<PendingPaymentRecord[]>([]);
  const [summary, setSummary] = useState<PendingPaymentSummary>({
    totalPendingRevenue: 0,
    recoveredRevenue: 0,
    recoveryConversionRate: 0,
    pendingOrdersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [notesByOrderId, setNotesByOrderId] = useState<Record<string, string>>({});

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [contacted, setContacted] = useState<string>("all");
  const [archived, setArchived] = useState<string>("active");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", status);
    params.set("contacted", contacted);
    params.set("archived", archived);
    if (search.trim()) params.set("search", search.trim());
    if (minValue.trim()) params.set("minValue", minValue.trim());
    if (maxValue.trim()) params.set("maxValue", maxValue.trim());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  }, [archived, contacted, dateFrom, dateTo, maxValue, minValue, search, status]);

  const fetchRecords = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = Boolean(options?.silent);
      if (!silent) {
        setIsRefreshing(true);
      }

      try {
        const response = await fetch(`/api/admin/pending-payments?${queryString}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as PendingPaymentsResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "Unable to load pending payments.");
        }

        setRecords(payload.records ?? []);
        setSummary(
          payload.summary ?? {
            totalPendingRevenue: 0,
            recoveredRevenue: 0,
            recoveryConversionRate: 0,
            pendingOrdersCount: 0,
          },
        );
        setErrorMessage(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load pending payments.";
        setErrorMessage(message);
        if (!silent) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [queryString],
  );

  useEffect(() => {
    void fetchRecords({ silent: true });
  }, [fetchRecords]);

  const updateOrder = async (
    orderId: string,
    payload: {
      followUpStatus?: "new" | "contacted" | "archived" | "dismissed";
      followUpNotes?: string;
      markContacted?: boolean;
      recoveryArchived?: boolean;
    },
    successMessage: string,
  ) => {
    setActionOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/pending-payments/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        toast.error(data.error ?? "Update failed.");
        return;
      }
      toast.success(successMessage);
      await fetchRecords({ silent: true });
    } catch {
      toast.error("Update failed.");
    } finally {
      setActionOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Pending Payments</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading recovery queue...</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Pending Revenue
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {formatCurrency(summary.totalPendingRevenue)}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Recovered Revenue
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {formatCurrency(summary.recoveredRevenue)}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Recovery Conversion
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {summary.recoveryConversionRate.toFixed(2)}%
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Pending Orders
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {summary.pendingOrdersCount}
          </p>
        </article>
      </section>

      <section className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="grid gap-2 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, phone..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 rounded-xl lg:col-span-2">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="payment_init_failed">Init Failed</SelectItem>
              <SelectItem value="payment_failed">Payment Failed</SelectItem>
              <SelectItem value="payment_timed_out">Timed Out</SelectItem>
              <SelectItem value="payment_cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contacted} onValueChange={setContacted}>
            <SelectTrigger className="h-10 rounded-xl lg:col-span-2">
              <SelectValue placeholder="Contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacted</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="uncontacted">Uncontacted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={archived} onValueChange={setArchived}>
            <SelectTrigger className="h-10 rounded-xl lg:col-span-2">
              <SelectValue placeholder="Archive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-10 rounded-xl lg:col-span-2"
            onClick={() => void fetchRecords()}
            disabled={isRefreshing}
          >
            <RefreshCcw className="size-4" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min value"
            value={minValue}
            onChange={(event) => setMinValue(event.target.value)}
            className="h-10 rounded-xl lg:col-span-2"
          />
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max value"
            value={maxValue}
            onChange={(event) => setMaxValue(event.target.value)}
            className="h-10 rounded-xl lg:col-span-2"
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="h-10 rounded-xl lg:col-span-2"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="h-10 rounded-xl lg:col-span-2"
          />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-[#f8ccd2] bg-[#fff2f4] p-4 text-sm text-[#8b1c2c]">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-3">
          {records.length ? (
            records.map((record) => {
              const expanded = expandedOrderId === record.orderId;
              const notesDraft = notesByOrderId[record.orderId] ?? record.followUpNotes ?? "";

              return (
                <article
                  key={record.orderId}
                  className="rounded-2xl border border-[var(--border)] bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        #{record.orderNumber}
                      </p>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        {record.customerName} • {record.customerPhone}
                      </p>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Created {formatShortDate(record.createdAt)} • Last attempt{" "}
                        {formatShortDate(record.lastPaymentAttemptAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={recoveryStateTone(record.recoveryState)}>
                        {recoveryStateLabel[record.recoveryState]}
                      </Badge>
                      <Badge variant={followUpTone(record.followUpStatus)}>
                        {record.followUpStatus}
                      </Badge>
                      {record.recoveryArchived ? <Badge variant="outline">archived</Badge> : null}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-[var(--foreground-muted)] md:grid-cols-3">
                    <p>
                      Value:{" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {formatCurrency(record.orderValue, record.currency)}
                      </span>
                    </p>
                    <p>
                      Retries:{" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {record.retryCount}
                      </span>
                    </p>
                    <p>
                      Payment:{" "}
                      <span className="font-semibold capitalize text-[var(--foreground)]">
                        {record.paymentStatus.replaceAll("_", " ")}
                      </span>
                    </p>
                    <p className="md:col-span-2">
                      Products:{" "}
                      <span className="text-[var(--foreground)]">
                        {record.productsAttempted.join(", ")}
                      </span>
                    </p>
                    <p>
                      Method:{" "}
                      <span className="text-[var(--foreground)]">
                        {record.paymentMethod.toUpperCase()}
                      </span>
                    </p>
                    {record.failureReason ? (
                      <p className="md:col-span-3">
                        Failure reason:{" "}
                        <span className="text-[#9e2a2a]">{record.failureReason}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() =>
                        setExpandedOrderId((current) =>
                          current === record.orderId ? null : record.orderId,
                        )
                      }
                    >
                      {expanded ? "Hide Details" : "View Full Order Details"}
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={actionOrderId === record.orderId}
                      onClick={async () => {
                        setActionOrderId(record.orderId);
                        try {
                          const response = await fetch(
                            `/api/admin/pending-payments/${record.orderId}/retry`,
                            {
                              method: "POST",
                            },
                          );
                          const data = (await response.json()) as {
                            ok: boolean;
                            error?: string;
                            customerMessage?: string;
                          };
                          if (!response.ok || !data.ok) {
                            toast.error(data.error ?? "Retry failed.");
                            return;
                          }
                          toast.success(
                            data.customerMessage ??
                              "STK push retry sent to customer phone.",
                          );
                          await fetchRecords({ silent: true });
                        } catch {
                          toast.error("Retry failed.");
                        } finally {
                          setActionOrderId(null);
                        }
                      }}
                    >
                      Retry STK Push
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={async () => {
                        const contactText = [record.customerPhone, record.customerEmail]
                          .filter(Boolean)
                          .join(" | ");
                        try {
                          await navigator.clipboard.writeText(contactText);
                          toast.success("Customer contact copied.");
                        } catch {
                          toast.error("Unable to copy contact.");
                        }
                      }}
                    >
                      <Copy className="size-3.5" />
                      Copy Contact
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={actionOrderId === record.orderId || Boolean(record.contactedAt)}
                      onClick={() =>
                        void updateOrder(
                          record.orderId,
                          { markContacted: true },
                          "Recovery lead marked as contacted.",
                        )
                      }
                    >
                      {record.contactedAt ? "Contacted" : "Mark As Contacted"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={actionOrderId === record.orderId}
                      onClick={() =>
                        void updateOrder(
                          record.orderId,
                          { recoveryArchived: !record.recoveryArchived },
                          record.recoveryArchived
                            ? "Recovery lead unarchived."
                            : "Recovery lead archived.",
                        )
                      }
                    >
                      {record.recoveryArchived ? "Unarchive" : "Archive / Dismiss"}
                    </Button>
                  </div>

                  {expanded ? (
                    <div className="mt-3 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
                      <div className="grid gap-1 text-xs text-[var(--foreground-muted)]">
                        <p>
                          Email:{" "}
                          <span className="text-[var(--foreground)]">
                            {record.customerEmail ?? "Not provided"}
                          </span>
                        </p>
                        <p>
                          Contacted at:{" "}
                          <span className="text-[var(--foreground)]">
                            {record.contactedAt
                              ? formatShortDate(record.contactedAt)
                              : "Not yet contacted"}
                          </span>
                        </p>
                      </div>
                      <Textarea
                        value={notesDraft}
                        onChange={(event) =>
                          setNotesByOrderId((state) => ({
                            ...state,
                            [record.orderId]: event.target.value,
                          }))
                        }
                        placeholder="Add internal follow-up notes..."
                        rows={4}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="rounded-full"
                          disabled={actionOrderId === record.orderId}
                          onClick={() =>
                            void updateOrder(
                              record.orderId,
                              { followUpNotes: notesDraft },
                              "Follow-up note saved.",
                            )
                          }
                        >
                          Save Notes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={actionOrderId === record.orderId}
                          onClick={() =>
                            void updateOrder(
                              record.orderId,
                              {
                                followUpStatus: record.followUpStatus === "new" ? "contacted" : "new",
                              },
                              "Follow-up status updated.",
                            )
                          }
                        >
                          Toggle Follow-up Status
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-5 text-sm text-[var(--foreground-muted)]">
              No recoverable checkouts match the selected filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
