import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database, Json } from "@/lib/supabase/database.types";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CallbackLogRow = Database["public"]["Tables"]["payment_callback_logs"]["Row"];

export interface PaymentLogItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  method: PaymentRow["method"];
  provider: string;
  status: PaymentRow["status"];
  amount: number;
  currency: PaymentRow["currency"];
  checkoutRequestId?: string;
  merchantRequestId?: string;
  providerReference?: string;
  errorMessage?: string;
  rawResponse?: Json;
  orderStatus?: OrderRow["status"];
  orderPaymentStatus?: OrderRow["payment_status"];
  reconciliationState: "matched" | "pending" | "failed" | "orphaned" | "needs_review";
  latestCallbackStatus?: CallbackLogRow["processing_status"];
  latestCallbackCode?: number | null;
  latestCallbackDescription?: string | null;
  latestCallbackPayload?: Json;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
}

function getReconciliationState(
  payment: PaymentRow,
  order?: OrderRow,
): PaymentLogItem["reconciliationState"] {
  if (!order) {
    return "orphaned";
  }

  if (payment.status === "success" && order.payment_status === "success") {
    return "matched";
  }

  if (payment.status === "initiated" || payment.status === "pending") {
    return "pending";
  }

  if (payment.status === "failed" || payment.status === "cancelled" || payment.status === "timed_out") {
    return "failed";
  }

  return "needs_review";
}

export async function getPaymentLogsFromSupabase(limit = 250): Promise<PaymentLogItem[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        "id,order_id,user_id,method,provider,status,amount,currency,checkout_request_id,merchant_request_id,provider_reference,raw_response,error_message,created_at,updated_at,confirmed_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !payments?.length) {
      return [];
    }

    const paymentRows = payments as PaymentRow[];
    const orderIds = [...new Set(paymentRows.map((payment) => payment.order_id))];
    const userIds = [...new Set(paymentRows.map((payment) => payment.user_id))];
    const paymentIds = [...new Set(paymentRows.map((payment) => payment.id))];

    const [{ data: orders }, { data: profiles }, { data: callbackLogs }] = await Promise.all([
      supabase
        .from("orders")
        .select("id,order_number,status,payment_status")
        .in("id", orderIds),
      supabase
        .from("profiles")
        .select("id,full_name,email")
        .in("id", userIds),
      supabase
        .from("payment_callback_logs")
        .select("id,payment_id,result_code,result_description,processing_status,payload,created_at")
        .in("payment_id", paymentIds)
        .order("created_at", { ascending: false }),
    ]);

    const orderById = new Map((orders as OrderRow[] | null)?.map((order) => [order.id, order]) ?? []);
    const profileById = new Map(
      (profiles as ProfileRow[] | null)?.map((profile) => [profile.id, profile]) ?? [],
    );

    const latestCallbackByPaymentId = new Map<string, CallbackLogRow>();
    for (const callbackLog of (callbackLogs as CallbackLogRow[] | null) ?? []) {
      if (!callbackLog.payment_id || latestCallbackByPaymentId.has(callbackLog.payment_id)) {
        continue;
      }
      latestCallbackByPaymentId.set(callbackLog.payment_id, callbackLog);
    }

    return paymentRows.map((payment) => {
      const order = orderById.get(payment.order_id);
      const profile = profileById.get(payment.user_id);
      const callbackLog = latestCallbackByPaymentId.get(payment.id);

      return {
        id: payment.id,
        orderId: payment.order_id,
        orderNumber: order?.order_number,
        userId: payment.user_id,
        customerName: profile?.full_name ?? undefined,
        customerEmail: profile?.email ?? undefined,
        method: payment.method,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        checkoutRequestId: payment.checkout_request_id ?? undefined,
        merchantRequestId: payment.merchant_request_id ?? undefined,
        providerReference: payment.provider_reference ?? undefined,
        errorMessage: payment.error_message ?? undefined,
        rawResponse: payment.raw_response ?? undefined,
        orderStatus: order?.status,
        orderPaymentStatus: order?.payment_status,
        reconciliationState: getReconciliationState(payment, order),
        latestCallbackStatus: callbackLog?.processing_status,
        latestCallbackCode: callbackLog?.result_code,
        latestCallbackDescription: callbackLog?.result_description,
        latestCallbackPayload: callbackLog?.payload,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        confirmedAt: payment.confirmed_at,
      };
    });
  } catch {
    return [];
  }
}
