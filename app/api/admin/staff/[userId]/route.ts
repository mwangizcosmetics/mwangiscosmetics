import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSuperAdminUser } from "@/lib/services/auth-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const updateStaffSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(8).max(30).optional().or(z.literal("")),
  role: z.enum(["super_admin", "staff_admin", "beba"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireSuperAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = updateStaffSchema.parse(await request.json());
    const { userId } = await params;
    if (userId === auth.user.id && payload.isActive === false) {
      return NextResponse.json(
        { ok: false, error: "You cannot deactivate your own account." },
        { status: 409 },
      );
    }
    const supabase = getSupabaseServiceRoleClient();
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, unknown> = {
      updated_at: nowIso,
    };
    if (payload.fullName !== undefined) {
      updatePayload.full_name = payload.fullName;
    }
    if (payload.phone !== undefined) {
      updatePayload.phone = payload.phone || null;
    }
    if (payload.role !== undefined) {
      updatePayload.role = payload.role;
    }
    if (payload.isActive !== undefined) {
      updatePayload.is_active = payload.isActive;
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select("id")
      .maybeSingle();

    if (error || !updatedProfile) {
      return NextResponse.json(
        { ok: false, error: "Unable to update staff profile." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Staff profile updated.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload.", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected update error." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireSuperAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { userId } = await params;
  if (userId === auth.user.id) {
    return NextResponse.json(
      { ok: false, error: "You cannot deactivate your own account." },
      { status: 409 },
    );
  }
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to deactivate staff profile." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Staff profile deactivated.",
  });
}
