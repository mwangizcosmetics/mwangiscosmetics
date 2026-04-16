import type { CartItem, DiscountRule, Product } from "@/lib/types/ecommerce";

export interface ProductPricingSnapshot {
  basePrice: number;
  finalPrice: number;
  compareAtPrice?: number;
  discountPercent: number;
  hasDiscount: boolean;
  appliedRule?: DiscountRule;
}

function toMoney(value: number) {
  return Math.max(Math.round(value), 0);
}

function pickLatestRule(rules: DiscountRule[]) {
  return [...rules].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function resolveApplicableDiscountRule(product: Product, rules: DiscountRule[]) {
  const activeRules = rules.filter((rule) => rule.isActive);

  const productRule = pickLatestRule(
    activeRules.filter(
      (rule) => rule.scope === "product" && rule.targetProductId === product.id,
    ),
  );
  if (productRule) {
    return productRule;
  }

  const categoryRule = pickLatestRule(
    activeRules.filter(
      (rule) =>
        rule.scope === "category" && rule.targetCategorySlug === product.categorySlug,
    ),
  );
  if (categoryRule) {
    return categoryRule;
  }

  return pickLatestRule(activeRules.filter((rule) => rule.scope === "global"));
}

export function getProductPricingSnapshot(product: Product, rules: DiscountRule[]) {
  const applicableRule = resolveApplicableDiscountRule(product, rules);
  const basePrice = toMoney(product.price);

  if (applicableRule) {
    const finalPrice = toMoney(basePrice - (basePrice * applicableRule.percent) / 100);
    return {
      basePrice,
      finalPrice,
      compareAtPrice: basePrice,
      discountPercent: applicableRule.percent,
      hasDiscount: finalPrice < basePrice,
      appliedRule: applicableRule,
    } satisfies ProductPricingSnapshot;
  }

  const legacyCompareAt = product.compareAtPrice ?? 0;
  if (legacyCompareAt > basePrice) {
    const discountPercent = Math.round(((legacyCompareAt - basePrice) / legacyCompareAt) * 100);
    return {
      basePrice,
      finalPrice: basePrice,
      compareAtPrice: legacyCompareAt,
      discountPercent,
      hasDiscount: true,
    } satisfies ProductPricingSnapshot;
  }

  return {
    basePrice,
    finalPrice: basePrice,
    discountPercent: 0,
    hasDiscount: false,
  } satisfies ProductPricingSnapshot;
}

export function getPricedCartItems(
  items: CartItem[],
  products: Product[],
  discountRules: DiscountRule[],
) {
  return items
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return null;
      }

      const pricing = getProductPricingSnapshot(product, discountRules);
      return {
        ...item,
        product,
        pricing,
        lineTotal: pricing.finalPrice * item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
