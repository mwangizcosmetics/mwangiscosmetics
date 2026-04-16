import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/services/auth-server";
import { getDeliveryOperationsFeed } from "@/lib/services/orders/delivery-ops-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export async function GET() {
  const auth = await requirePermission("admin:delivery_management");
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const supabase = getSupabaseServiceRoleClient();
  const result = await getDeliveryOperationsFeed({
    supabase,
    actorRole: auth.profile.role,
    actorUserId: auth.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orders: result.orders,
  });
}
