import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/services/auth-server";
import { getUserOrdersBundle } from "@/lib/services/orders/order-query-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const supabase = getSupabaseServiceRoleClient();
  const bundle = await getUserOrdersBundle(supabase, auth.user.id);
  if (!bundle.ok) {
    return NextResponse.json({ ok: false, error: bundle.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orders: bundle.orders,
    orderEvents: bundle.orderEvents,
    refunds: bundle.refunds,
  });
}
