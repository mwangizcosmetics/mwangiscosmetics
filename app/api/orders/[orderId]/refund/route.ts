import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/services/auth-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const requestSchema = z.object({
  reason: z.string().trim().min(2),
  note: z.string().trim().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const { orderId } = await params;
    const payload = requestSchema.parse(await request.json());
    const supabase = getSupabaseServiceRoleClient();

    const { data: order } = await supabase
      .from("orders")
      .select("id,user_id,status")
      .eq("id", orderId)
      .maybeSingle();

    if (!order || order.user_id !== auth.user.id) {
      return NextResponse.json(
        { ok: false, error: "Order not found." },
        { status: 404 },
      );
    }

    if (
      order.status === "cancelled" ||
      order.status === "refunded" ||
      order.status === "pending_payment" ||
      order.status === "payment_init_failed" ||
      order.status === "failed_payment"
    ) {
      return NextResponse.json(
        { ok: false, error: "This order is not eligible for refunds yet." },
        { status: 409 },
      );
    }

    const { data: existingRefund } = await supabase
      .from("refunds")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();
    if (existingRefund) {
      return NextResponse.json(
        { ok: false, error: "A refund request already exists for this order." },
        { status: 409 },
      );
    }

    const nowIso = new Date().toISOString();
    const { error: refundError } = await supabase.from("refunds").insert({
      order_id: orderId,
      user_id: auth.user.id,
      reason: payload.reason,
      note: payload.note || null,
      status: "requested",
      created_at: nowIso,
      updated_at: nowIso,
    });
    if (refundError) {
      return NextResponse.json(
        { ok: false, error: "Unable to create refund request." },
        { status: 500 },
      );
    }

    await Promise.all([
      supabase
        .from("orders")
        .update({
          status: "refund_requested",
          updated_at: nowIso,
        })
        .eq("id", orderId),
      supabase.from("order_events").insert({
        order_id: orderId,
        event_type: "refund_requested",
        message: "Refund requested by customer",
        created_at: nowIso,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Refund request submitted.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid refund payload.", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected refund error.",
      },
      { status: 500 },
    );
  }
}
