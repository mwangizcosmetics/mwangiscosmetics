import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/services/auth-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const updateAnnouncementSchema = z.object({
  message: z.string().trim().min(1, "Message is required.").max(280, "Message is too long."),
  isActive: z.boolean(),
});

export async function GET() {
  const auth = await requirePermission("admin:products_management");
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("site_announcements")
    .select("id,message,is_active,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to load announcement settings." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    announcement: data
      ? {
          id: data.id,
          message: data.message,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null,
  });
}

export async function PUT(request: Request) {
  const auth = await requirePermission("admin:products_management");
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const payload = updateAnnouncementSchema.parse(await request.json());
    const supabase = getSupabaseServiceRoleClient();
    const nowIso = new Date().toISOString();

    const { data: existingAnnouncement, error: selectError } = await supabase
      .from("site_announcements")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json(
        { ok: false, error: "Unable to load existing announcement." },
        { status: 500 },
      );
    }

    if (existingAnnouncement?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("site_announcements")
        .update({
          message: payload.message,
          is_active: payload.isActive,
          updated_at: nowIso,
        })
        .eq("id", existingAnnouncement.id)
        .select("id,message,is_active,created_at,updated_at")
        .single();

      if (updateError) {
        return NextResponse.json(
          { ok: false, error: "Unable to update announcement." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        announcement: {
          id: updated.id,
          message: updated.message,
          isActive: updated.is_active,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        },
      });
    }

    const { data: created, error: createError } = await supabase
      .from("site_announcements")
      .insert({
        message: payload.message,
        is_active: payload.isActive,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id,message,is_active,created_at,updated_at")
      .single();

    if (createError) {
      return NextResponse.json(
        { ok: false, error: "Unable to create announcement." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      announcement: {
        id: created.id,
        message: created.message,
        isActive: created.is_active,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      },
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
