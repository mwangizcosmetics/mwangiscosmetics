import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/services/auth-server";
import { markReadyForDispatch } from "@/lib/services/orders/delivery-ops-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const requestSchema = z.object({
  dispatchNote: z.string().trim().max(4000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requirePermission("admin:mark_ready_for_dispatch");
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = requestSchema.parse(await request.json().catch(() => ({})));
    const { orderId } = await params;
    const supabase = getSupabaseServiceRoleClient();
    const result = await markReadyForDispatch({
      supabase,
      orderId,
      actorUserId: auth.user.id,
      dispatchNote: payload.dispatchNote,
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
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
