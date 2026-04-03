"use client";

import Link from "next/link";
import { Heart, ShoppingBag, UserRound } from "lucide-react";
import { useMemo } from "react";

import { brand } from "@/lib/constants/brand";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { Button } from "@/components/ui/button";
import { SiteContainer } from "@/components/shared/site-container";
import { cn } from "@/lib/utils/cn";

function IconBadge({ count, className }: { count: number; className?: string }) {
  if (count < 1) return null;
  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--brand-900)] px-1 text-[10px] font-semibold text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function StoreHeader() {
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const wishlistCount = wishlistItems.length;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <SiteContainer className="py-2">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <p className="text-sm font-semibold tracking-[0.08em] text-[var(--foreground)] sm:text-base">
              {brand.name}
            </p>
          </Link>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" asChild className="relative size-8 rounded-full">
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="size-4" />
                <IconBadge count={wishlistCount} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative size-8 rounded-full">
              <Link href="/cart" aria-label="Cart">
                <ShoppingBag className="size-4" />
                <IconBadge count={cartCount} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="size-8 rounded-full">
              <Link href="/account" aria-label="Account">
                <UserRound className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </SiteContainer>
    </header>
  );
}
