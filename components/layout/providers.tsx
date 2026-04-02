"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <Toaster richColors closeButton />
    </>
  );
}
