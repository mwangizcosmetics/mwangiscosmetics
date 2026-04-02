"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";

import { products } from "@/lib/data/mock-data";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { ProductCard } from "@/components/shop/product-card";
import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((state) => state.items);

  const wishlistProducts = useMemo(
    () =>
      wishlistItems
        .map((item) => products.find((product) => product.id === item.productId))
        .filter((product): product is (typeof products)[number] => Boolean(product)),
    [wishlistItems],
  );

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Wishlist"
        title="Saved for Later"
        description="Keep track of products you want to revisit."
      />
      {wishlistProducts.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved items yet"
          description="Tap the heart icon on any product to build your wishlist."
          actionLabel="Discover products"
          actionHref="/shop"
        />
      )}
    </SiteContainer>
  );
}
