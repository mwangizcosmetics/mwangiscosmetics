"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  serviceCounties as seedServiceCounties,
  serviceTowns as seedServiceTowns,
} from "@/lib/data/mock-data";
import type { ServiceCounty, ServiceTown } from "@/lib/types/ecommerce";

interface StoreResult {
  ok: boolean;
  message?: string;
}

interface TownPayload {
  name: string;
  deliveryFee?: number | null;
  etaMinValue?: number | null;
  etaMaxValue?: number | null;
  etaUnit?: "hours" | "days" | null;
}

interface ServiceLocationStore {
  counties: ServiceCounty[];
  towns: ServiceTown[];
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  addCounty: (name: string) => StoreResult;
  updateCounty: (countyId: string, name: string) => StoreResult;
  toggleCountyActive: (countyId: string) => void;
  deleteCounty: (countyId: string) => void;
  addTown: (countyId: string, payload: TownPayload) => StoreResult;
  updateTown: (townId: string, payload: TownPayload) => StoreResult;
  toggleTownActive: (townId: string) => void;
  deleteTown: (townId: string) => void;
}

function createId(prefix: "county" | "town") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export const useServiceLocationStore = create<ServiceLocationStore>()(
  persist(
    (set, get) => ({
      counties: seedServiceCounties,
      towns: seedServiceTowns,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      addCounty: (name) => {
        const normalizedName = normalizeName(name);
        if (!normalizedName) {
          return { ok: false, message: "County name is required." };
        }

        const exists = get().counties.some(
          (county) => county.name.toLowerCase() === normalizedName.toLowerCase(),
        );
        if (exists) {
          return { ok: false, message: "County already exists." };
        }

        const now = new Date().toISOString();
        const nextCounty: ServiceCounty = {
          id: createId("county"),
          name: normalizedName,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          counties: [...state.counties, nextCounty].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        }));

        return { ok: true };
      },
      updateCounty: (countyId, name) => {
        const normalizedName = normalizeName(name);
        if (!normalizedName) {
          return { ok: false, message: "County name is required." };
        }

        const exists = get().counties.some(
          (county) =>
            county.id !== countyId &&
            county.name.toLowerCase() === normalizedName.toLowerCase(),
        );
        if (exists) {
          return { ok: false, message: "County name already in use." };
        }

        set((state) => ({
          counties: state.counties.map((county) =>
            county.id === countyId
              ? { ...county, name: normalizedName, updatedAt: new Date().toISOString() }
              : county,
          ),
        }));

        return { ok: true };
      },
      toggleCountyActive: (countyId) =>
        set((state) => ({
          counties: state.counties.map((county) =>
            county.id === countyId
              ? { ...county, isActive: !county.isActive, updatedAt: new Date().toISOString() }
              : county,
          ),
        })),
      deleteCounty: (countyId) =>
        set((state) => ({
          counties: state.counties.filter((county) => county.id !== countyId),
          towns: state.towns.filter((town) => town.countyId !== countyId),
        })),
      addTown: (countyId, payload) => {
        const normalizedName = normalizeName(payload.name);
        if (!normalizedName) {
          return { ok: false, message: "Town or center name is required." };
        }

        const exists = get().towns.some(
          (town) =>
            town.countyId === countyId &&
            town.name.toLowerCase() === normalizedName.toLowerCase(),
        );
        if (exists) {
          return {
            ok: false,
            message: "Town already exists in this county.",
          };
        }

        const now = new Date().toISOString();
        const nextTown: ServiceTown = {
          id: createId("town"),
          countyId,
          name: normalizedName,
          isActive: true,
          etaMinValue: payload.etaMinValue ?? null,
          etaMaxValue: payload.etaMaxValue ?? null,
          etaUnit: payload.etaUnit ?? "days",
          deliveryFee: payload.deliveryFee ?? null,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          towns: [...state.towns, nextTown].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        return { ok: true };
      },
      updateTown: (townId, payload) => {
        const normalizedName = normalizeName(payload.name);
        if (!normalizedName) {
          return { ok: false, message: "Town or center name is required." };
        }

        const town = get().towns.find((candidate) => candidate.id === townId);
        if (!town) {
          return { ok: false, message: "Town not found." };
        }

        const exists = get().towns.some(
          (candidate) =>
            candidate.id !== townId &&
            candidate.countyId === town.countyId &&
            candidate.name.toLowerCase() === normalizedName.toLowerCase(),
        );
        if (exists) {
          return {
            ok: false,
            message: "Town name already in use for this county.",
          };
        }

        set((state) => ({
          towns: state.towns.map((candidate) =>
            candidate.id === townId
              ? {
                  ...candidate,
                  name: normalizedName,
                  etaMinValue: payload.etaMinValue ?? null,
                  etaMaxValue: payload.etaMaxValue ?? null,
                  etaUnit: payload.etaUnit ?? "days",
                  deliveryFee: payload.deliveryFee ?? null,
                  updatedAt: new Date().toISOString(),
                }
              : candidate,
          ),
        }));
        return { ok: true };
      },
      toggleTownActive: (townId) =>
        set((state) => ({
          towns: state.towns.map((town) =>
            town.id === townId
              ? { ...town, isActive: !town.isActive, updatedAt: new Date().toISOString() }
              : town,
          ),
        })),
      deleteTown: (townId) =>
        set((state) => ({
          towns: state.towns.filter((town) => town.id !== townId),
        })),
    }),
    {
      name: "mwangiz-service-locations-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ counties: state.counties, towns: state.towns }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
