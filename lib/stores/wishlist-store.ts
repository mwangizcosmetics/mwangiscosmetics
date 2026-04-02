"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { initialWishlistItems } from "@/lib/data/mock-data";
import type { WishlistItem } from "@/lib/types/ecommerce";

interface WishlistStore {
  items: WishlistItem[];
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  toggleItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: initialWishlistItems,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      toggleItem: (productId) => {
        const found = get().items.some((item) => item.productId === productId);
        if (found) {
          set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
          }));
          return;
        }

        set((state) => ({
          items: [...state.items, { productId, createdAt: new Date().toISOString() }],
        }));
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      hasItem: (productId) => get().items.some((item) => item.productId === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "mwangiz-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
