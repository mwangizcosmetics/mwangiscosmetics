import type { CartItem, Product } from "@/lib/types/ecommerce";

export function getDetailedCartItems(items: CartItem[], products: Product[]) {
  return items
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function calculateCartTotals(
  items: CartItem[],
  products: Product[],
  options?: {
    shippingFee?: number;
    discountAmount?: number;
  },
) {
  const detailedItems = getDetailedCartItems(items, products);
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
