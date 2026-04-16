import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/services/auth-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const patchSchema = z
  .object({
    followUpStatus: z.enum(["new", "contacted", "archived", "dismissed"]).optional(),
    followUpNotes: z.string().trim().max(4000).optional(),
    markContacted: z.boolean().optional(),
    recoveryArchived: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.followUpStatus !== undefined ||
      value.followUpNotes !== undefined ||
      value.markContacted !== undefined ||
      value.recoveryArchived !== undefined,
    "No changes submitted.",
  );

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const adminAuth = await requirePermission("admin:financials");
  if (!adminAuth.ok) {
    return NextResponse.json({ ok: false, error: adminAuth.message }, { status: adminAuth.status });
  }

  try {
    const payload = patchSchema.parse(await request.json());
    const { orderId } = await params;
    const nowIso = new Date().toISOString();
    const supabase = getSupabaseServiceRoleClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: nowIso,
    };

    if (payload.followUpStatus !== undefined) {
      updatePayload.follow_up_status = payload.followUpStatus;
    }
    if (payload.followUpNotes !== undefined) {
      updatePayload.follow_up_notes = payload.followUpNotes || null;
    }
    if (payload.recoveryArchived !== undefined) {
      updatePayload.recovery_archived = payload.recoveryArchived;
    }
    if (payload.markContacted !== undefined) {
      updatePayload.contacted_at = payload.markContacted ? nowIso : null;
      if (payload.markContacted && payload.followUpStatus === undefined) {
        updatePayload.follow_up_status = "contacted";
      }
    }

    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select("id,follow_up_status,follow_up_notes,contacted_at,recovery_archived,updated_at")
      .maybeSingle();

    if (error || !updatedOrder) {
      return NextResponse.json(
        { ok: false, error: "Unable to update recovery record." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      order: updatedOrder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid recovery update payload.",
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected recovery update error.",
      },
      { status: 500 },
    );
  }
}
