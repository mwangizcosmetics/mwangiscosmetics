import type { SupabaseClient } from "@supabase/supabase-js";

import { initiatePaymentWithProvider } from "@/lib/services/payments/server";
import type { Database } from "@/lib/supabase/database.types";

type ServiceSupabaseClient = SupabaseClient<Database>;

interface MpesaInitInput {
  supabase: ServiceSupabaseClient;
  orderId: string;
  orderNumber: string;
  userId: string;
  paymentId: string;
  amount: number;
  phone: string;
  callbackUrl: string;
  retryAttempt: boolean;
}

export interface MpesaInitOutput {
  ok: boolean;
  status: "pending" | "success" | "failed";
  mocked?: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  customerMessage?: string;
  errorMessage?: string;
}

const ACTIVE_PAYMENT_STATUSES: Database["public"]["Tables"]["payments"]["Row"]["status"][] = [
  "initiated",
  "pending",
];

export async function hasRecentActiveAttempt(
  supabase: ServiceSupabaseClient,
  orderId: string,
  withinSeconds = 90,
) {
  const thresholdIso = new Date(Date.now() - withinSeconds * 1000).toISOString();
  const { data } = await supabase
    .from("payments")
    .select("id,status,updated_at")
    .eq("order_id", orderId)
    .in("status", ACTIVE_PAYMENT_STATUSES)
    .gte("updated_at", thresholdIso)
    .order("updated_at", { ascending: false })
    .limit(1);

  return Boolean(data?.length);
}

export async function initiateMpesaForPersistedOrder(
  input: MpesaInitInput,
): Promise<MpesaInitOutput> {
  const nowIso = new Date().toISOString();
  let nextRetryCount: number | undefined;
  if (input.retryAttempt) {
    const { data: currentOrder } = await input.supabase
      .from("orders")
      .select("retry_count")
      .eq("id", input.orderId)
      .maybeSingle();
    nextRetryCount = (currentOrder?.retry_count ?? 0) + 1;
  }

  const result = await initiatePaymentWithProvider({
    method: "mpesa",
    provider: "mpesa_daraja",
    amount: input.amount,
    currency: "KES",
    phone: input.phone,
    orderId: input.orderId,
    accountReference: input.orderNumber,
    description: "MWANGIZ order payment",
    callbackUrl: input.callbackUrl,
  });

  if (!result.ok) {
    const message = result.errorMessage ?? "Unable to initiate M-Pesa payment.";
    await Promise.all([
      input.supabase
        .from("payments")
        .update({
          status: "init_failed",
          error_message: message,
          raw_response: (result.rawResponse ?? null) as Database["public"]["Tables"]["payments"]["Update"]["raw_response"],
          updated_at: nowIso,
        })
        .eq("id", input.paymentId),
      input.supabase
        .from("orders")
        .update({
          status: "payment_init_failed",
          payment_status: "failed",
          payment_init_error: message,
          last_payment_attempt_at: nowIso,
          retry_count: nextRetryCount,
          updated_at: nowIso,
        })
        .eq("id", input.orderId),
    ]);

    return {
      ok: false,
      status: "failed",
      errorMessage: message,
    };
  }

  await input.supabase
    .from("payments")
    .update({
      status: "pending",
      checkout_request_id: result.checkoutRequestId ?? null,
      merchant_request_id: result.merchantRequestId ?? null,
      provider_reference: result.providerReference ?? null,
      error_message: null,
      raw_response: (result.rawResponse ?? null) as Database["public"]["Tables"]["payments"]["Update"]["raw_response"],
      updated_at: nowIso,
    })
    .eq("id", input.paymentId);

  const orderUpdate: Database["public"]["Tables"]["orders"]["Update"] = {
    status: "pending_payment",
    payment_status: "pending",
    payment_init_error: null,
    last_payment_attempt_at: nowIso,
    retry_count: nextRetryCount,
    updated_at: nowIso,
  };

  await input.supabase.from("orders").update(orderUpdate).eq("id", input.orderId);

  return {
    ok: true,
    status: result.mocked ? "pending" : "pending",
    mocked: result.mocked,
    checkoutRequestId: result.checkoutRequestId,
    merchantRequestId: result.merchantRequestId,
    customerMessage: result.customerMessage,
  };
}
