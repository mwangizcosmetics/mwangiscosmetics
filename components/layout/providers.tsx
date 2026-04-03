"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import { useAddressStore } from "@/lib/stores/address-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { useServiceLocationStore } from "@/lib/stores/service-location-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

export function Providers({ children }: { children: ReactNode }) {
  const commerceHydrated = useCommerceStore((state) => state.hasHydrated);
  const syncBannersFromRemote = useCommerceStore((state) => state.syncBannersFromRemote);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useAddressStore.persist.rehydrate();
    useServiceLocationStore.persist.rehydrate();
    useCommerceStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!commerceHydrated) {
      return;
    }

    void syncBannersFromRemote();
  }, [commerceHydrated, syncBannersFromRemote]);

  return (
    <>
      {children}
      <Toaster richColors closeButton />
    </>
  );
}
