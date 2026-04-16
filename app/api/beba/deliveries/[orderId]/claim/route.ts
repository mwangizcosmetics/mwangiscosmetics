import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBebaUser } from "@/lib/services/auth-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const requestSchema = z.object({
  note: z.string().trim().max(4000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireBebaUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = requestSchema.parse(await request.json().catch(() => ({})));
    const { orderId } = await params;
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase.rpc("claim_delivery_order", {
      p_order_id: orderId,
      p_beba_user_id: auth.user.id,
      p_note: payload.note ?? null,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to claim delivery order." },
        { status: 500 },
      );
    }

    const response = (data ?? {}) as { ok?: boolean; error?: string; order_id?: string };
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: response.error ?? "Order claim rejected." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: response.order_id ?? orderId,
      message: "Delivery claimed successfully.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid claim payload.", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected claim error.",
      },
      { status: 500 },
    );
  }
}
