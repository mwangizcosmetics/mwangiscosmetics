import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/database.types";
import type { ServiceCounty, ServiceTown } from "@/lib/types/ecommerce";
import { getServiceCoverageSeed } from "@/lib/services/service-location-service";

type ServiceCountyRow = Database["public"]["Tables"]["service_counties"]["Row"];
type ServiceTownRow = Database["public"]["Tables"]["service_towns"]["Row"];

function mapCountyRow(row: ServiceCountyRow): ServiceCounty {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTownRow(row: ServiceTownRow): ServiceTown {
  return {
    id: row.id,
    countyId: row.county_id,
    name: row.name,
    isActive: row.is_active,
    etaMinValue: row.eta_min_value,
    etaMaxValue: row.eta_max_value,
    etaUnit: row.eta_unit,
    estimatedDeliveryDays: row.estimated_delivery_days,
    deliveryFee: row.delivery_fee,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getServiceCoverageFromSupabase() {
  const fallback = getServiceCoverageSeed();

  if (!hasSupabaseEnv()) {
    return fallback;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const [{ data: counties, error: countiesError }, { data: towns, error: townsError }] =
      await Promise.all([
        supabase
          .from("service_counties")
          .select("id,name,is_active,created_at,updated_at")
          .order("name", { ascending: true }),
        supabase
          .from("service_towns")
          .select(
            "id,county_id,name,is_active,eta_min_value,eta_max_value,eta_unit,estimated_delivery_days,delivery_fee,created_at,updated_at",
          )
          .order("name", { ascending: true }),
      ]);

    if (countiesError || townsError) {
      return fallback;
    }

    const mappedCounties = (counties ?? []).map((county) =>
      mapCountyRow(county as ServiceCountyRow),
    );
    const mappedTowns = (towns ?? []).map((town) =>
      mapTownRow(town as ServiceTownRow),
    );

    if (!mappedCounties.length || !mappedTowns.length) {
      return fallback;
    }

    return {
      counties: mappedCounties,
      towns: mappedTowns,
    };
  } catch {
    return fallback;
  }
}
