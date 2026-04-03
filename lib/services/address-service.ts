import type { Address } from "@/lib/types/ecommerce";
import type { AddressFormValues } from "@/lib/validators/address";
import type { ServiceCounty, ServiceTown } from "@/lib/types/ecommerce";

interface AddressFromFormOptions {
  values: AddressFormValues;
  userId: string;
  counties: ServiceCounty[];
  towns: ServiceTown[];
  existingAddress?: Address;
  forcePrimary?: boolean;
}

function resolveCountyName(counties: ServiceCounty[], countyId: string) {
  return counties.find((county) => county.id === countyId)?.name ?? "";
}

function resolveTownName(towns: ServiceTown[], townCenterId: string) {
  return towns.find((town) => town.id === townCenterId)?.name ?? "";
}

function createAddressId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `addr-${Math.random().toString(36).slice(2, 12)}`;
}

export function mapAddressFromForm({
  values,
  userId,
  counties,
  towns,
  existingAddress,
  forcePrimary = false,
}: AddressFromFormOptions): Address {
  const now = new Date().toISOString();
  const isPrimary = forcePrimary || Boolean(values.isPrimary);

  return {
    id: existingAddress?.id ?? createAddressId(),
    userId,
    label: values.label?.trim() || undefined,
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    countyId: values.countyId,
    county: resolveCountyName(counties, values.countyId),
    townCenterId: values.townCenterId,
    townCenter: resolveTownName(towns, values.townCenterId),
    streetAddress: values.streetAddress.trim(),
    buildingOrHouse: values.buildingOrHouse?.trim() || undefined,
    landmark: values.landmark?.trim() || undefined,
    isPrimary,
    createdAt: existingAddress?.createdAt ?? now,
    updatedAt: now,
  };
}

export function ensureSinglePrimary(addresses: Address[], primaryAddressId: string) {
  return addresses.map((address) => ({
    ...address,
    isPrimary: address.id === primaryAddressId,
  }));
}

export function formatAddressLine(address: Address) {
  const optional = [address.buildingOrHouse, address.landmark]
    .filter(Boolean)
    .join(" • ");

  if (!optional) {
    return address.streetAddress;
  }

  return `${address.streetAddress} • ${optional}`;
}

export function formatCountyTown(address: Address) {
  return `${address.townCenter}, ${address.county}`;
}
