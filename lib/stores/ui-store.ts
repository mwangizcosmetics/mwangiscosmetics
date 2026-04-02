"use client";

import { create } from "zustand";

interface UiStore {
  isFilterDrawerOpen: boolean;
  isSearchSheetOpen: boolean;
  isCartSheetOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;
  setSearchSheetOpen: (open: boolean) => void;
  setCartSheetOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isFilterDrawerOpen: false,
  isSearchSheetOpen: false,
  isCartSheetOpen: false,
  setFilterDrawerOpen: (open) => set({ isFilterDrawerOpen: open }),
  setSearchSheetOpen: (open) => set({ isSearchSheetOpen: open }),
  setCartSheetOpen: (open) => set({ isCartSheetOpen: open }),
}));
