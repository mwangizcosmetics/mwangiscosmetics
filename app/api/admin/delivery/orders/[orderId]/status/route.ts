import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSuperAdminUser } from "@/lib/services/auth-server";
import { setDeliveryOutcome } from "@/lib/services/orders/delivery-ops-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const requestSchema = z.object({
  targetStatus: z.enum(["delivered", "delivery_failed", "returned"]),
  deliveryNote: z.string().trim().max(4000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireSuperAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const { orderId } = await params;
    const supabase = getSupabaseServiceRoleClient();

    const result = await setDeliveryOutcome({
      supabase,
      orderId,
      actorUserId: auth.user.id,
      actorRole: auth.profile.role,
      targetStatus: payload.targetStatus,
      deliveryNote: payload.deliveryNote,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      order: result.order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload.", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected update error.",
      },
      { status: 500 },
    );
  }
}
