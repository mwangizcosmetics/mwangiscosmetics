import type { CartItem, DiscountRule, Product } from "@/lib/types/ecommerce";
import { getPricedCartItems } from "@/lib/services/pricing-service";

export function getDetailedCartItems(
  items: CartItem[],
  products: Product[],
  discountRules: DiscountRule[] = [],
) {
  return getPricedCartItems(items, products, discountRules);
}

export function calculateCartTotals(
  items: CartItem[],
  products: Product[],
  discountRules: DiscountRule[] = [],
  options?: {
    shippingFee?: number;
    discountAmount?: number;
  },
) {
  const detailedItems = getDetailedCartItems(items, products, discountRules);
  const subtotal = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = options?.discountAmount ?? 0;
  const shipping =
    typeof options?.shippingFee === "number"
      ? options.shippingFee
      : subtotal > 7500
        ? 0
        : subtotal === 0
          ? 0
          : 350;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxable * 0.08);
  const total = taxable + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };
}
