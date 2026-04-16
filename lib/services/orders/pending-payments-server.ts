import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";

type ServiceSupabaseClient = SupabaseClient<Database>;
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

export type RecoveryStatusFilter =
  | "all"
  | "pending_payment"
  | "payment_init_failed"
  | "payment_failed"
  | "payment_timed_out"
  | "payment_cancelled";

export interface PendingPaymentFilters {
  status?: RecoveryStatusFilter;
  contacted?: "all" | "contacted" | "uncontacted";
  archived?: "all" | "active" | "archived";
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type RecoveryState =
  | "pending_payment"
  | "payment_init_failed"
  | "payment_failed"
  | "payment_timed_out"
  | "payment_cancelled";

export interface PendingPaymentRecord {
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  lastPaymentAttemptAt: string;
  orderValue: number;
  currency: Database["public"]["Enums"]["currency_code"];
  productsAttempted: string[];
  failureReason?: string;
  retryCount: number;
  recoveryState: RecoveryState;
  paymentMethod: string;
  paymentStatus: string;
  followUpStatus: OrderRow["follow_up_status"];
  followUpNotes?: string;
  contactedAt?: string;
  recoveryArchived: boolean;
}

export interface PendingPaymentSummary {
  totalPendingRevenue: number;
  recoveredRevenue: number;
  recoveryConversionRate: number;
  pendingOrdersCount: number;
}

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function extractProducts(items: OrderItemRow[]) {
  return items.map((item) => {
    const snapshot = asRecord(item.product_snapshot);
    const name = asString(snapshot.productName || snapshot.name);
    if (name) {
      return name;
    }
    return `Product ${item.product_id?.slice(0, 8) ?? "N/A"}`;
  });
}

function deriveRecoveryState(
  order: OrderRow,
  latestPayment?: PaymentRow,
): RecoveryState | null {
  if (order.payment_status === "success") {
    return null;
  }

  if (order.status === "pending_payment") {
    return "pending_payment";
  }
  if (order.status === "payment_init_failed") {
    return "payment_init_failed";
  }

  switch (latestPayment?.status) {
    case "init_failed":
      return "payment_init_failed";
    case "failed":
      return "payment_failed";
    case "timed_out":
      return "payment_timed_out";
    case "cancelled":
      return "payment_cancelled";
    case "initiated":
    case "pending":
      return "pending_payment";
    default:
      return null;
  }
}

export async function getPendingPaymentRecoveryData(
  supabase: ServiceSupabaseClient,
  filters: PendingPaymentFilters = {},
) {
  let ordersQuery = supabase
    .from("orders")
    .select(
      "id,order_number,user_id,status,total,currency,created_at,payment_status,payment_method,shipping_address,last_payment_attempt_at,payment_init_error,retry_count,follow_up_status,follow_up_notes,contacted_at,recovery_archived",
    )
    .in("payment_status", ["pending", "failed"])
    .order("created_at", { ascending: false })
    .limit(500);

  if (typeof filters.minValue === "number") {
    ordersQuery = ordersQuery.gte("total", Math.max(0, Math.round(filters.minValue)));
  }
  if (typeof filters.maxValue === "number") {
    ordersQuery = ordersQuery.lte("total", Math.max(0, Math.round(filters.maxValue)));
  }
  if (filters.dateFrom) {
    ordersQuery = ordersQuery.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    ordersQuery = ordersQuery.lte("created_at", filters.dateTo);
  }
  if (filters.archived === "active") {
    ordersQuery = ordersQuery.eq("recovery_archived", false);
  } else if (filters.archived === "archived") {
    ordersQuery = ordersQuery.eq("recovery_archived", true);
  }
  if (filters.contacted === "contacted") {
    ordersQuery = ordersQuery.not("contacted_at", "is", null);
  } else if (filters.contacted === "uncontacted") {
    ordersQuery = ordersQuery.is("contacted_at", null);
  }

  const { data: ordersData, error: ordersError } = await ordersQuery;
  if (ordersError) {
    return {
      ok: false as const,
      message: "Unable to load pending payments.",
      records: [] as PendingPaymentRecord[],
      summary: {
        totalPendingRevenue: 0,
        recoveredRevenue: 0,
        recoveryConversionRate: 0,
        pendingOrdersCount: 0,
      } satisfies PendingPaymentSummary,
    };
  }

  const orders = (ordersData ?? []) as OrderRow[];
  if (!orders.length) {
    return {
      ok: true as const,
      records: [] as PendingPaymentRecord[],
      summary: {
        totalPendingRevenue: 0,
        recoveredRevenue: 0,
        recoveryConversionRate: 0,
        pendingOrdersCount: 0,
      } satisfies PendingPaymentSummary,
    };
  }

  const orderIds = orders.map((order) => order.id);
  const [{ data: orderItemsData }, { data: paymentsData }, { data: recoveredOrders }] =
    await Promise.all([
      supabase
        .from("order_items")
        .select("id,order_id,product_id,quantity,unit_price,product_snapshot,created_at")
        .in("order_id", orderIds),
      supabase
        .from("payments")
        .select(
          "id,order_id,user_id,method,provider,status,amount,currency,phone,checkout_request_id,merchant_request_id,provider_reference,error_message,created_at,updated_at,confirmed_at",
        )
        .in("order_id", orderIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id,total")
        .eq("payment_status", "success")
        .gt("retry_count", 0),
    ]);

  const orderItemsByOrderId = new Map<string, OrderItemRow[]>();
  for (const item of (orderItemsData ?? []) as OrderItemRow[]) {
    const group = orderItemsByOrderId.get(item.order_id) ?? [];
    group.push(item);
    orderItemsByOrderId.set(item.order_id, group);
  }

  const latestPaymentByOrderId = new Map<string, PaymentRow>();
  for (const payment of (paymentsData ?? []) as PaymentRow[]) {
    if (!latestPaymentByOrderId.has(payment.order_id)) {
      latestPaymentByOrderId.set(payment.order_id, payment);
    }
  }

  const searchQuery = filters.search?.trim().toLowerCase() ?? "";
  const mappedRecords = orders.reduce<PendingPaymentRecord[]>((acc, order) => {
      const shipping = asRecord(order.shipping_address);
      const latestPayment = latestPaymentByOrderId.get(order.id);
      const recoveryState = deriveRecoveryState(order, latestPayment);
      if (!recoveryState) {
        return acc;
      }

      const items = orderItemsByOrderId.get(order.id) ?? [];
      const customerName = asString(shipping.fullName) || "Unknown customer";
      const customerPhone =
        asString(shipping.phone) || latestPayment?.phone || "No phone captured";
      const customerEmail = asString(shipping.email) || undefined;
      const failureReason =
        order.payment_init_error ||
        latestPayment?.error_message ||
        (latestPayment?.status && latestPayment.status !== "pending"
          ? `Payment ${latestPayment.status}`
          : undefined);

      acc.push({
        orderId: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        customerName,
        customerPhone,
        customerEmail,
        createdAt: order.created_at,
        lastPaymentAttemptAt:
          order.last_payment_attempt_at ||
          latestPayment?.updated_at ||
          latestPayment?.created_at ||
          order.created_at,
        orderValue: order.total,
        currency: order.currency,
        productsAttempted: extractProducts(items),
        failureReason,
        retryCount: order.retry_count ?? 0,
        recoveryState,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        followUpStatus: order.follow_up_status,
        followUpNotes: order.follow_up_notes ?? undefined,
        contactedAt: order.contacted_at ?? undefined,
        recoveryArchived: order.recovery_archived,
      });

      return acc;
    }, []);

  const records = mappedRecords.filter((record) => {
      if (filters.status && filters.status !== "all" && record.recoveryState !== filters.status) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const haystack = [
        record.orderId,
        record.orderNumber,
        record.customerName,
        record.customerPhone,
        record.customerEmail ?? "",
        ...record.productsAttempted,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchQuery);
    });

  const pendingActiveRecords = records.filter((record) => !record.recoveryArchived);
  const totalPendingRevenue = pendingActiveRecords.reduce(
    (sum, record) => sum + record.orderValue,
    0,
  );

  const recoveredRevenue = ((recoveredOrders ?? []) as Array<{ id: string; total: number }>).reduce(
    (sum, order) => sum + order.total,
    0,
  );
  const recoveredCount = (recoveredOrders ?? []).length;
  const pendingCount = pendingActiveRecords.length;
  const recoveryConversionRate =
    pendingCount + recoveredCount > 0
      ? Math.round((recoveredCount / (pendingCount + recoveredCount)) * 10000) / 100
      : 0;

  return {
    ok: true as const,
    records,
    summary: {
      totalPendingRevenue,
      recoveredRevenue,
      recoveryConversionRate,
      pendingOrdersCount: pendingCount,
    } satisfies PendingPaymentSummary,
  };
}
