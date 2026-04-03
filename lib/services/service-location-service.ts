import {
  serviceCounties as seedCounties,
  serviceTowns as seedTowns,
} from "@/lib/data/mock-data";
import type { ServiceCounty, ServiceTown } from "@/lib/types/ecommerce";

export function getServiceCoverageSeed() {
  return {
    counties: seedCounties,
    towns: seedTowns,
  };
}

export function getActiveCounties(
  counties: ServiceCounty[],
  towns: ServiceTown[],
) {
  const countyTownCount = new Map<string, number>();
  for (const town of towns) {
    if (!town.isActive) {
      continue;
    }
    const nextCount = (countyTownCount.get(town.countyId) ?? 0) + 1;
    countyTownCount.set(town.countyId, nextCount);
  }

  return counties
    .filter(
      (county) => county.isActive && (countyTownCount.get(county.id) ?? 0) > 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getActiveTownsForCounty(towns: ServiceTown[], countyId: string) {
  return towns
    .filter((town) => town.countyId === countyId && town.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveCountyName(counties: ServiceCounty[], countyId: string) {
  return counties.find((county) => county.id === countyId)?.name ?? "";
}

export function resolveTownName(towns: ServiceTown[], townCenterId: string) {
  return towns.find((town) => town.id === townCenterId)?.name ?? "";
}
