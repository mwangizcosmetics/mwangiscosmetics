"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { initialCartItems } from "@/lib/data/mock-data";
import type { CartItem } from "@/lib/types/ecommerce";

interface CartStore {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

function mergeQuantity(items: CartItem[], productId: string, quantity: number) {
  const existing = items.find((item) => item.productId === productId);
  if (!existing) {
    return [...items, { productId, quantity }];
  }
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
  );
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: initialCartItems,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      addItem: (productId, quantity = 1) =>
        set((state) => ({ items: mergeQuantity(state.items, productId, quantity) })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.productId === productId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "mwangiz-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
