"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import { useAddressStore } from "@/lib/stores/address-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useServiceLocationStore } from "@/lib/stores/service-location-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useAddressStore.persist.rehydrate();
    useServiceLocationStore.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <Toaster richColors closeButton />
    </>
  );
}
