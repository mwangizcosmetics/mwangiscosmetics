import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSuperAdminUser } from "@/lib/services/auth-server";
import { normalizeRole } from "@/lib/services/rbac";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const createStaffSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30).optional(),
  role: z.enum(["super_admin", "staff_admin", "beba"]),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  const auth = await requireSuperAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role,is_active,created_at,updated_at")
    .in("role", ["super_admin", "staff_admin", "beba", "admin"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to load staff accounts." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    staff: (profiles ?? []).map((profile) => ({
      id: profile.id,
      fullName: profile.full_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      role: normalizeRole(profile.role),
      isActive: profile.is_active ?? true,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = createStaffSchema.parse(await request.json());
    const supabase = getSupabaseServiceRoleClient();

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
        role: payload.role,
      },
    });

    if (createError || !createdUser.user) {
      return NextResponse.json(
        { ok: false, error: createError?.message ?? "Unable to create staff user." },
        { status: 400 },
      );
    }

    const nowIso = new Date().toISOString();
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: createdUser.user.id,
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone || null,
        role: payload.role,
        is_active: payload.isActive,
        updated_at: nowIso,
      });

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: "User created but profile update failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      userId: createdUser.user.id,
      message: "Staff account created.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload.", issues: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected create error." },
      { status: 500 },
    );
  }
}
