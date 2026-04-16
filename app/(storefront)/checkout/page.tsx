"use client";

import { CreditCard, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const discountRules = useCommerceStore((state) => state.discountRules);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>();
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
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

  const detailedItems = useMemo(
    () => getDetailedCartItems(items, products, discountRules),
    [discountRules, items, products],
  );
  const totals = useMemo(
    () =>
      calculateCartTotals(items, products, discountRules, {
        shippingFee: deliveryQuote.isServiceable ? deliveryQuote.fee : 0,
        discountAmount,
      }),
    [
      deliveryQuote.fee,
      deliveryQuote.isServiceable,
      discountAmount,
      discountRules,
      items,
      products,
    ],
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
              if (isSubmittingCheckout) {
                return;
              }

              setIsSubmittingCheckout(true);
              try {
                const response = await fetch("/api/checkout/create-order", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    paymentMethod,
                    couponCode: appliedCouponCode,
                    items: detailedItems.map((item) => ({
                      productId: item.productId,
                      productSlug: item.product.slug,
                      quantity: item.quantity,
                      selectedShade: item.selectedShade,
                    })),
                    shipping: {
                      fullName: address.fullName,
                      phone: address.phone,
                      email: address.email,
                      countyId: address.countyId,
                      county: address.county,
                      townCenterId: address.townCenterId,
                      townCenter: address.townCenter,
                      streetAddress: address.streetAddress,
                      buildingOrHouse: address.buildingOrHouse,
                      landmark: address.landmark,
                    },
                  }),
                });

                const payload = (await response.json()) as {
                  ok: boolean;
                  recoverable?: boolean;
                  orderId?: string;
                  orderNumber?: string;
                  paymentStatus?: string;
                  customerMessage?: string;
                  error?: string;
                };

                if (!response.ok || !payload.ok) {
                  if (response.status === 401) {
                    toast.error("Please sign in to complete checkout.");
                    router.push("/auth/login");
                    return;
                  }

                  if (payload.recoverable) {
                    toast.warning(
                      payload.error ??
                        "Order saved, but payment initiation failed. Retry from Orders.",
                    );
                    clearCart();
                    router.push("/orders");
                    return;
                  }
                  toast.error(payload.error ?? "Unable to place order right now.");
                  return;
                }

                clearCart();
                toast.success(
                  payload.customerMessage ??
                    `Order #${payload.orderNumber ?? payload.orderId ?? ""} created. Complete M-Pesa prompt on your phone.`,
                );
                router.push("/orders");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to place order right now.",
                );
              } finally {
                setIsSubmittingCheckout(false);
              }
            }}
          />
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-[var(--brand-700)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Payment Processing</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Checkout is now server-persisted before payment initiation. If M-Pesa initiation fails, your order stays recoverable under Orders and Admin Pending Payments.
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
