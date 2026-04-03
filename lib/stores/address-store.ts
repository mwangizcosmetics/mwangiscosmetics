"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { sampleProfile } from "@/lib/data/mock-data";
import { ensureSinglePrimary } from "@/lib/services/address-service";
import type { Address } from "@/lib/types/ecommerce";

const MAX_SAVED_ADDRESSES = 2;

interface StoreResult {
  ok: boolean;
  message?: string;
}

interface AddressStore {
  addresses: Address[];
  selectedAddressId: string | null;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  addAddress: (address: Address) => StoreResult;
  updateAddress: (addressId: string, patch: Partial<Address>) => StoreResult;
  removeAddress: (addressId: string) => StoreResult;
  setPrimaryAddress: (addressId: string) => void;
  selectAddress: (addressId: string | null) => void;
}

function sanitizePrimary(addresses: Address[]) {
  const primary = addresses.find((address) => address.isPrimary);
  if (primary) {
    return ensureSinglePrimary(addresses, primary.id);
  }

  const [first, ...rest] = addresses;
  if (!first) {
    return [];
  }

  return [{ ...first, isPrimary: true }, ...rest.map((address) => ({ ...address, isPrimary: false }))];
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: sanitizePrimary(sampleProfile.savedAddresses),
      selectedAddressId: sampleProfile.savedAddresses.find((address) => address.isPrimary)?.id ?? null,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      addAddress: (address) => {
        const current = get().addresses;
        if (current.length >= MAX_SAVED_ADDRESSES) {
          return {
            ok: false,
            message: "You can save up to 2 addresses for now.",
          };
        }

        const next = sanitizePrimary([...current, address]);
        set({
          addresses: address.isPrimary ? ensureSinglePrimary(next, address.id) : next,
          selectedAddressId: address.id,
        });
        return { ok: true };
      },
      updateAddress: (addressId, patch) => {
        const current = get().addresses;
        if (!current.some((address) => address.id === addressId)) {
          return {
            ok: false,
            message: "Address not found.",
          };
        }

        const merged = current.map((address) =>
          address.id === addressId ? { ...address, ...patch, updatedAt: new Date().toISOString() } : address,
        );

        const next =
          patch.isPrimary === true ? ensureSinglePrimary(merged, addressId) : sanitizePrimary(merged);

        set({ addresses: next });
        return { ok: true };
      },
      removeAddress: (addressId) => {
        const filtered = get().addresses.filter((address) => address.id !== addressId);
        const next = sanitizePrimary(filtered);

        set((state) => ({
          addresses: next,
          selectedAddressId:
            state.selectedAddressId === addressId
              ? next.find((address) => address.isPrimary)?.id ?? null
              : state.selectedAddressId,
        }));

        return { ok: true };
      },
      setPrimaryAddress: (addressId) =>
        set((state) => ({
          addresses: ensureSinglePrimary(state.addresses, addressId),
          selectedAddressId: addressId,
        })),
      selectAddress: (addressId) => set({ selectedAddressId: addressId }),
    }),
    {
      name: "mwangiz-addresses-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
