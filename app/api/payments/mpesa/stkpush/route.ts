import { NextResponse } from "next/server";
import { z } from "zod";

import { initiatePaymentWithProvider } from "@/lib/services/payments/server";
import type { Database, Json } from "@/lib/supabase/database.types";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const requestSchema = z.object({
  orderId: z.string().min(1),
  userId: z.string().optional(),
  amount: z.number().positive(),
  phone: z.string().min(9),
  accountReference: z.string().min(1),
  description: z.string().optional(),
});

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function persistPaymentAttempt(input: {
  orderId: string;
  userId?: string;
  amount: number;
  phone: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  raw: Record<string, unknown> | undefined;
  mocked?: boolean;
}) {
  if (!input.userId || !isUuid(input.orderId) || !isUuid(input.userId)) {
    return;
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const paymentInsert: Database["public"]["Tables"]["payments"]["Insert"] = {
      order_id: input.orderId,
      user_id: input.userId,
      method: "mpesa",
      provider: "mpesa_daraja",
      status: input.mocked ? "success" : "pending",
      amount: Math.round(input.amount),
      currency: "KES",
      phone: input.phone,
      checkout_request_id: input.checkoutRequestId ?? null,
      merchant_request_id: input.merchantRequestId ?? null,
      raw_response: (input.raw ?? null) as Json,
      confirmed_at: input.mocked ? new Date().toISOString() : null,
    };
    await supabase
      .from("payments")
      .upsert(paymentInsert, {
        onConflict: "checkout_request_id",
      });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Unable to persist payment attempt in Supabase", error);
    }
  }
}

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
  try {
    const payload = requestSchema.parse(await request.json());

    const result = await initiatePaymentWithProvider({
      method: "mpesa",
      provider: "mpesa_daraja",
      amount: payload.amount,
      currency: "KES",
      phone: payload.phone,
      orderId: payload.orderId,
      accountReference: payload.accountReference,
      description: payload.description ?? `MWANGIZ order ${payload.orderId.slice(-6)}`,
      callbackUrl: resolveCallbackUrl(request),
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.errorMessage ?? "Unable to initiate payment.",
          raw: result.rawResponse,
        },
        { status: 502 },
      );
    }

    await persistPaymentAttempt({
      orderId: payload.orderId,
      userId: payload.userId,
      amount: payload.amount,
      phone: payload.phone,
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
      raw: result.rawResponse,
      mocked: result.mocked,
    });

    return NextResponse.json({
      ok: true,
      status: "pending",
      mocked: Boolean(result.mocked),
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
      providerReference: result.providerReference,
      customerMessage:
        result.customerMessage ??
        "STK push sent. Complete payment on your phone.",
      raw: result.rawResponse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid payment request payload.",
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected payment initiation error.",
      },
      { status: 500 },
    );
  }
}
