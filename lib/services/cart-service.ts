import { products } from "@/lib/data/mock-data";
import type { CartItem } from "@/lib/types/ecommerce";

export function getDetailedCartItems(items: CartItem[]) {
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

export function calculateCartTotals(items: CartItem[]) {
  const detailedItems = getDetailedCartItems(items);
  const subtotal = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 7500 ? 0 : subtotal === 0 ? 0 : 350;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    total,
  };
}
