"use client";

import { CreditCard, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckoutAddressForm } from "@/components/checkout/checkout-address-form";
import { CheckoutSummaryCard } from "@/components/checkout/checkout-summary-card";
import { useCartStore } from "@/lib/stores/cart-store";
import { calculateCartTotals, getDetailedCartItems } from "@/lib/services/cart-service";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);

  const detailedItems = useMemo(() => getDetailedCartItems(items), [items]);
  const totals = useMemo(() => calculateCartTotals(items), [items]);

  if (!detailedItems.length) {
    return (
      <SiteContainer className="py-6 sm:py-8">
        <EmptyState
          icon={ShoppingBag}
          title="Checkout unavailable"
          description="Your cart is empty. Add products before continuing to checkout."
          actionLabel="Go to shop"
          actionHref="/shop"
        />
      </SiteContainer>
    );
  }

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Checkout"
        title="Secure Checkout"
        description="Complete delivery details and payment to place your order."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <CheckoutAddressForm />
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-[var(--brand-700)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Payment Integration Placeholder</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Connect your preferred gateway (M-Pesa, card processor) in `lib/services` and secure it with server-side APIs.
            </p>
          </section>
        </div>
        <CheckoutSummaryCard
          items={detailedItems}
          subtotal={totals.subtotal}
          shipping={totals.shipping}
          tax={totals.tax}
          total={totals.total}
        />
      </div>
    </SiteContainer>
  );
}
