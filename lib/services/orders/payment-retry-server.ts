import type { SupabaseClient } from "@supabase/supabase-js";

import { hasRecentActiveAttempt, initiateMpesaForPersistedOrder } from "@/lib/services/payments/order-payment-server";
import type { Database, Json } from "@/lib/supabase/database.types";

type ServiceSupabaseClient = SupabaseClient<Database>;
type RecoverableOrderInput = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "status" | "payment_status"
>;

function readPhoneFromShippingAddress(shippingAddress: Json) {
  if (!shippingAddress || typeof shippingAddress !== "object" || Array.isArray(shippingAddress)) {
    return "";
  }
  const phone = (shippingAddress as Record<string, unknown>).phone;
  return typeof phone === "string" ? phone : "";
}

function isRecoverableOrder(order: RecoverableOrderInput) {
  if (order.payment_status === "success") {
    return false;
  }

  if (
    order.status === "delivered" ||
    order.status === "cancelled" ||
    order.status === "refunded" ||
    order.status === "shipped"
  ) {
    return false;
  }

  return (
    order.status === "pending_payment" ||
    order.status === "payment_init_failed" ||
    order.status === "failed_payment"
  );
}

export async function retryPendingPaymentForOrder(input: {
  supabase: ServiceSupabaseClient;
  orderId: string;
  callbackUrl: string;
  actorUserId: string;
  allowAdminOverride?: boolean;
}) {
  const { supabase, orderId, callbackUrl } = input;
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id,order_number,user_id,status,total,payment_status,payment_method,shipping_address,retry_count,recovery_archived",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false as const, status: 404, message: "Order not found." };
  }

  if (!input.allowAdminOverride && order.user_id !== input.actorUserId) {
    return {
      ok: false as const,
      status: 403,
      message: "You can only retry your own order payments.",
    };
  }

  if (order.recovery_archived) {
    return {
      ok: false as const,
      status: 409,
      message: "Recovery lead is archived. Unarchive before retrying.",
    };
  }

  if (!isRecoverableOrder(order)) {
    return {
      ok: false as const,
      status: 409,
      message: "This order is not eligible for payment retry.",
    };
  }

  if (order.payment_method !== "mpesa") {
    return {
      ok: false as const,
      status: 409,
      message: "Only M-Pesa orders can be retried at the moment.",
    };
  }

  if ((order.retry_count ?? 0) >= 5) {
    return {
      ok: false as const,
      status: 429,
      message: "Retry limit reached for this order.",
    };
  }

  const hasActiveAttempt = await hasRecentActiveAttempt(supabase, orderId, 120);
  if (hasActiveAttempt) {
    return {
      ok: false as const,
      status: 409,
      message: "An active payment attempt is already in progress.",
    };
  }

  const phone = readPhoneFromShippingAddress(order.shipping_address);
  if (!phone) {
    return {
      ok: false as const,
      status: 409,
      message: "Order is missing a recoverable phone number.",
    };
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      user_id: order.user_id,
      method: "mpesa",
      provider: "mpesa_daraja",
      status: "initiated",
      amount: order.total,
      currency: "KES",
      phone,
      raw_response: {
        source: "retry",
      } as Database["public"]["Tables"]["payments"]["Insert"]["raw_response"],
    })
    .select("id")
    .maybeSingle();

  if (paymentError || !payment) {
    return {
      ok: false as const,
      status: 500,
      message: "Unable to create retry payment attempt.",
    };
  }

  const mpesa = await initiateMpesaForPersistedOrder({
    supabase,
    orderId: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    paymentId: payment.id,
    amount: order.total,
    phone,
    callbackUrl,
    retryAttempt: true,
  });

  if (!mpesa.ok) {
    return {
      ok: false as const,
      status: 409,
      message: mpesa.errorMessage ?? "Payment retry failed to start.",
      orderId: order.id,
      orderNumber: order.order_number,
    };
  }

  return {
    ok: true as const,
    status: 200,
    orderId: order.id,
    orderNumber: order.order_number,
    checkoutRequestId: mpesa.checkoutRequestId,
    merchantRequestId: mpesa.merchantRequestId,
    customerMessage: mpesa.customerMessage,
    mocked: mpesa.mocked,
  };
}
