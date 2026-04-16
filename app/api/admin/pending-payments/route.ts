import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/services/auth-server";
import {
  getPendingPaymentRecoveryData,
  type PendingPaymentFilters,
  type RecoveryStatusFilter,
} from "@/lib/services/orders/pending-payments-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const adminAuth = await requirePermission("admin:financials");
  if (!adminAuth.ok) {
    return NextResponse.json({ ok: false, error: adminAuth.message }, { status: adminAuth.status });
  }

  const url = new URL(request.url);
  const status = (url.searchParams.get("status") ?? "all") as RecoveryStatusFilter;
  const contacted = (url.searchParams.get("contacted") ?? "all") as
    | "all"
    | "contacted"
    | "uncontacted";
  const archived = (url.searchParams.get("archived") ?? "active") as
    | "all"
    | "active"
    | "archived";

  const filters: PendingPaymentFilters = {
    status,
    contacted,
    archived,
    minValue: parseNumber(url.searchParams.get("minValue")),
    maxValue: parseNumber(url.searchParams.get("maxValue")),
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  };

  const supabase = getSupabaseServiceRoleClient();
  const result = await getPendingPaymentRecoveryData(supabase, filters);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    records: result.records,
    summary: result.summary,
  });
}
