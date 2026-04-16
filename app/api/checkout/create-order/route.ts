import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/services/auth-server";
import { createPendingOrderWithPayment } from "@/lib/services/orders/checkout-persistence";
import { initiateMpesaForPersistedOrder } from "@/lib/services/payments/order-payment-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const requestSchema = z.object({
  paymentMethod: z.enum(["mpesa", "card", "cash"]),
  couponCode: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productSlug: z.string().trim().optional(),
        quantity: z.number().int().positive(),
        selectedShade: z.string().optional(),
      }),
    )
    .min(1),
  shipping: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email().optional().or(z.literal("")),
    countyId: z.string().min(1),
    county: z.string().min(1),
    townCenterId: z.string().min(1),
    townCenter: z.string().min(1),
    streetAddress: z.string().min(4),
    buildingOrHouse: z.string().optional(),
    landmark: z.string().optional(),
  }),
});

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

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const serviceSupabase = getSupabaseServiceRoleClient();

    const created = await createPendingOrderWithPayment({
      supabase: serviceSupabase,
      userId: auth.user.id,
      paymentMethod: payload.paymentMethod,
      items: payload.items,
      shippingSnapshot: {
        ...payload.shipping,
        email: payload.shipping.email || undefined,
      },
      couponCode: payload.couponCode,
    });

    if (!created.ok) {
      return NextResponse.json(
        { ok: false, error: created.message ?? "Unable to create order." },
        { status: 400 },
      );
    }

    if (payload.paymentMethod !== "mpesa") {
      await Promise.all([
        serviceSupabase
          .from("payments")
          .update({
            status: "init_failed",
            error_message: `${payload.paymentMethod} payment is not enabled yet.`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", created.payment.id),
        serviceSupabase
          .from("orders")
          .update({
            status: "payment_init_failed",
            payment_status: "failed",
            payment_init_error: `${payload.paymentMethod} payment is not enabled yet.`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", created.order.id),
      ]);

      return NextResponse.json(
        {
          ok: false,
          recoverable: true,
          orderId: created.order.id,
          orderNumber: created.order.orderNumber,
          error: `${payload.paymentMethod} payment is not enabled yet. Use M-Pesa.`,
        },
        { status: 409 },
      );
    }

    const mpesa = await initiateMpesaForPersistedOrder({
      supabase: serviceSupabase,
      orderId: created.order.id,
      orderNumber: created.order.orderNumber,
      userId: auth.user.id,
      paymentId: created.payment.id,
      amount: created.order.total,
      phone: payload.shipping.phone,
      callbackUrl: resolveCallbackUrl(request),
      retryAttempt: false,
    });

    if (!mpesa.ok) {
      return NextResponse.json(
        {
          ok: false,
          recoverable: true,
          orderId: created.order.id,
          orderNumber: created.order.orderNumber,
          paymentId: created.payment.id,
          error: mpesa.errorMessage ?? "Payment initiation failed.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: created.order.id,
      orderNumber: created.order.orderNumber,
      paymentId: created.payment.id,
      paymentStatus: mpesa.status,
      checkoutRequestId: mpesa.checkoutRequestId,
      merchantRequestId: mpesa.merchantRequestId,
      customerMessage: mpesa.customerMessage,
      mocked: mpesa.mocked,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid checkout payload.",
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected checkout error.",
      },
      { status: 500 },
    );
  }
}
