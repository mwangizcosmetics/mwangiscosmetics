"use client";

import { CreditCard, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { sampleProfile } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckoutAddressForm } from "@/components/checkout/checkout-address-form";
import { CheckoutSummaryCard } from "@/components/checkout/checkout-summary-card";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { validateCoupon } from "@/lib/services/commerce-selectors";
import { calculateCartTotals, getDetailedCartItems } from "@/lib/services/cart-service";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const products = useCommerceStore((state) => state.products);
  const coupons = useCommerceStore((state) => state.coupons);
  const placeOrder = useCommerceStore((state) => state.placeOrder);
  const incrementCouponUsage = useCommerceStore((state) => state.incrementCouponUsage);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>();
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryQuote, setDeliveryQuote] = useState<{
    isServiceable: boolean;
    fee: number;
    etaText: string;
    countyName: string;
    townName: string;
    etaMinValue?: number | null;
    etaMaxValue?: number | null;
    etaUnit?: "hours" | "days" | null;
  }>({
    isServiceable: false,
    fee: 0,
    etaText: "Unavailable",
    countyName: "",
    townName: "",
  });

  const detailedItems = useMemo(() => getDetailedCartItems(items, products), [items, products]);
  const totals = useMemo(
    () =>
      calculateCartTotals(items, products, {
        shippingFee: deliveryQuote.isServiceable ? deliveryQuote.fee : 0,
        discountAmount,
      }),
    [deliveryQuote.fee, deliveryQuote.isServiceable, discountAmount, items, products],
  );

  const handleApplyCoupon = () => {
    const result = validateCoupon(coupons, couponCode, totals.subtotal);
    if (!result.ok) {
      setAppliedCouponCode(undefined);
      setDiscountAmount(0);
      toast.error(result.message);
      return;
    }
    if (!result.coupon) {
      setAppliedCouponCode(undefined);
      setDiscountAmount(0);
      toast.error("Coupon could not be applied.");
      return;
    }

    setDiscountAmount(result.discountAmount);
    setAppliedCouponCode(result.coupon.code);
    toast.success(result.message);
  };

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
        description="Complete delivery details, apply coupon, and place your order."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <CheckoutAddressForm
            onDeliveryQuoteChange={(quote) => {
              setDeliveryQuote(quote);
            }}
            onSubmitCheckout={async ({ address, paymentMethod, deliveryQuote: latestQuote }) => {
              if (!latestQuote.isServiceable) {
                toast.error("Choose a serviceable delivery location.");
                return;
              }

              const orderItems = detailedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.price,
                productSnapshot: {
                  name: item.product.name,
                  image: item.product.images[0]?.url ?? "",
                },
              }));

              const result = placeOrder({
                userId: sampleProfile.id,
                items: orderItems,
                subtotal: totals.subtotal,
                discount: totals.discount,
                shipping: totals.shipping,
                tax: totals.tax,
                total: totals.total,
                paymentMethod,
                shippingAddress: address,
                deliverySnapshot: {
                  county: latestQuote.countyName,
                  townCenter: latestQuote.townName,
                  deliveryFee: latestQuote.fee,
                  etaMinValue: latestQuote.etaMinValue,
                  etaMaxValue: latestQuote.etaMaxValue,
                  etaUnit: latestQuote.etaUnit,
                  etaText: latestQuote.etaText,
                },
              });

              if (!result.ok || !result.order) {
                toast.error(result.message ?? "Unable to place order right now.");
                return;
              }
              if (appliedCouponCode) {
                incrementCouponUsage(appliedCouponCode);
              }

              clearCart();
              toast.success(`Order #${result.order.orderNumber} placed successfully.`);
              router.push("/orders");
            }}
          />
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
          discount={totals.discount}
          shipping={totals.shipping}
          deliveryEtaText={deliveryQuote.isServiceable ? deliveryQuote.etaText : undefined}
          deliveryLocationText={
            deliveryQuote.isServiceable
              ? `${deliveryQuote.townName}, ${deliveryQuote.countyName}`
              : undefined
          }
          tax={totals.tax}
          total={totals.total}
          couponCode={couponCode}
          appliedCouponCode={appliedCouponCode}
          onCouponCodeChange={setCouponCode}
          onApplyCoupon={handleApplyCoupon}
        />
      </div>
    </SiteContainer>
  );
}
