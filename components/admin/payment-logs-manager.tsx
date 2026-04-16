"use client";

import { CalendarRange, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { PaymentLogItem } from "@/lib/services/payments/payment-log-server";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentLogsManagerProps {
  logs: PaymentLogItem[];
}

function statusTone(status: PaymentLogItem["status"]): "default" | "warning" | "soft" | "outline" {
  if (status === "success") return "default";
  if (status === "failed" || status === "cancelled" || status === "timed_out") return "warning";
  if (status === "pending" || status === "initiated") return "soft";
  return "outline";
}

function reconciliationTone(
  state: PaymentLogItem["reconciliationState"],
): "default" | "warning" | "soft" | "outline" {
  if (state === "matched") return "default";
  if (state === "failed" || state === "orphaned") return "warning";
  if (state === "pending") return "soft";
  return "outline";
}

export function PaymentLogsManager({ logs }: PaymentLogsManagerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const referenceTimestamp = useMemo(() => {
    return logs.reduce((latest, log) => {
      const createdAt = new Date(log.createdAt).getTime();
      return createdAt > latest ? createdAt : latest;
    }, 0);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const cutoff =
      dateFilter === "24h"
        ? referenceTimestamp - 24 * 60 * 60 * 1000
        : dateFilter === "7d"
          ? referenceTimestamp - 7 * 24 * 60 * 60 * 1000
          : dateFilter === "30d"
            ? referenceTimestamp - 30 * 24 * 60 * 60 * 1000
            : 0;

    return logs.filter((log) => {
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      if (cutoff && new Date(log.createdAt).getTime() < cutoff) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        log.id,
        log.orderId,
        log.orderNumber ?? "",
        log.userId,
        log.customerName ?? "",
        log.customerEmail ?? "",
        log.checkoutRequestId ?? "",
        log.merchantRequestId ?? "",
        log.providerReference ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [dateFilter, logs, referenceTimestamp, searchValue, statusFilter]);

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Payment Logs</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Track payment attempts, callback outcomes, and reconciliation health.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by order, transaction, customer, callback ID..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="timed_out">Timed Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-10 rounded-xl">
              <CalendarRange className="size-4" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredLogs.length ? (
          filteredLogs.map((log) => {
            const expanded = expandedLogId === log.id;
            return (
              <article
                key={log.id}
                className="rounded-2xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {log.orderNumber ? `#${log.orderNumber}` : `Order ${log.orderId.slice(-8)}`}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatShortDate(log.createdAt)} • {formatCurrency(log.amount, log.currency)}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {log.customerName ?? "Unknown customer"}
                      {log.customerEmail ? ` - ${log.customerEmail}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusTone(log.status)}>{log.status}</Badge>
                    <Badge variant={reconciliationTone(log.reconciliationState)}>
                      {log.reconciliationState}
                    </Badge>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-xs font-medium text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
                      onClick={() =>
                        setExpandedLogId((current) => (current === log.id ? null : log.id))
                      }
                    >
                      Payload
                      <ChevronDown className={`size-3.5 transition ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-1 text-xs text-[var(--foreground-muted)] md:grid-cols-2">
                  <p>Checkout ID: {log.checkoutRequestId ?? "N/A"}</p>
                  <p>Merchant ID: {log.merchantRequestId ?? "N/A"}</p>
                  <p>Provider Ref: {log.providerReference ?? "N/A"}</p>
                  <p>Callback Status: {log.latestCallbackStatus ?? "No callback yet"}</p>
                  {log.errorMessage ? <p className="md:col-span-2">Error: {log.errorMessage}</p> : null}
                </div>

                {expanded ? (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3 text-[11px] text-[var(--foreground-muted)]">
                    {JSON.stringify(log.latestCallbackPayload ?? log.rawResponse ?? {}, null, 2)}
                  </pre>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-5 text-sm text-[var(--foreground-muted)]">
            No payment logs match the current filters.
          </div>
        )}
      </div>
    </section>
  );
}
