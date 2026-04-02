"use client";

import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummaryCard } from "@/components/cart/cart-summary-card";
import { useCartStore } from "@/lib/stores/cart-store";
import { calculateCartTotals, getDetailedCartItems } from "@/lib/services/cart-service";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  const detailedItems = useMemo(() => getDetailedCartItems(items), [items]);
  const totals = useMemo(() => calculateCartTotals(items), [items]);

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Cart"
        title="Your Beauty Bag"
        description="Review your selected products before checkout."
      />
      {detailedItems.length ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {detailedItems.map((item) => (
              <CartLineItem
                key={item.productId}
                product={item.product}
                quantity={item.quantity}
              />
            ))}
          </div>
          <CartSummaryCard
            subtotal={totals.subtotal}
            shipping={totals.shipping}
            tax={totals.tax}
            total={totals.total}
          />
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add products you love to begin your checkout journey."
          actionLabel="Shop products"
          actionHref="/shop"
        />
      )}
    </SiteContainer>
  );
}
