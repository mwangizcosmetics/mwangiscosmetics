import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/services/auth-server";
import { retryPendingPaymentForOrder } from "@/lib/services/orders/payment-retry-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

function resolveCallbackUrl(request: Request) {
  const configured = process.env.MPESA_CALLBACK_URL;
  const callbackSecret = process.env.MPESA_CALLBACK_SECRET;
  if (configured) {
    return configured;
  }

  const url = new URL(request.url);
  const callbackUrl = new URL("/api/payments/mpesa/callback", url.origin);
  if (callbackSecret) {
    callbackUrl.searchParams.set("token", callbackSecret);
  }
  return callbackUrl.toString();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const adminAuth = await requirePermission("admin:financials");
  if (!adminAuth.ok) {
    return NextResponse.json({ ok: false, error: adminAuth.message }, { status: adminAuth.status });
  }

  const { orderId } = await params;
  const supabase = getSupabaseServiceRoleClient();
  const result = await retryPendingPaymentForOrder({
    supabase,
    orderId,
    callbackUrl: resolveCallbackUrl(request),
    actorUserId: adminAuth.user.id,
    allowAdminOverride: true,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    checkoutRequestId: result.checkoutRequestId,
    merchantRequestId: result.merchantRequestId,
    customerMessage: result.customerMessage,
    mocked: result.mocked,
  });
}
