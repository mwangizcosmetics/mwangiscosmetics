import type {
  Banner,
  Category,
  Coupon,
  Order,
  Product,
  ServiceCounty,
  ServiceTown,
} from "@/lib/types/ecommerce";
import { formatEtaRange } from "@/lib/utils/format";

export type ProductSort =
  | "featured"
  | "newest"
  | "best-selling"
  | "price-asc"
  | "price-desc"
  | "rating-desc";

function bySort(sort: ProductSort) {
  switch (sort) {
    case "newest":
      return (a: Product, b: Product) =>
        Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    case "best-selling":
      return (a: Product, b: Product) =>
        Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
    case "price-asc":
      return (a: Product, b: Product) => a.price - b.price;
    case "price-desc":
      return (a: Product, b: Product) => b.price - a.price;
    case "rating-desc":
      return (a: Product, b: Product) => b.rating - a.rating;
    case "featured":
    default:
      return (a: Product, b: Product) =>
        Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
  }
}

export function getActiveCategories(categories: Category[]) {
  return categories.filter((category) => category.isActive !== false);
}

export function getActiveProducts(products: Product[]) {
  return products.filter((product) => product.isActive !== false);
}

export function getActiveProductsByCategory(
  products: Product[],
  categorySlug: string,
) {
  return getActiveProducts(products).filter(
    (product) => product.categorySlug === categorySlug,
  );
}

export function queryProducts(
  products: Product[],
  options: {
    search?: string;
    category?: string;
    chip?: string;
    sort?: ProductSort;
  } = {},
) {
  const { search = "", category, chip, sort = "featured" } = options;
  const normalizedSearch = search.toLowerCase().trim();

  const filtered = getActiveProducts(products).filter((product) => {
    const categoryMatch = category ? product.categorySlug === category : true;
    const searchMatch = normalizedSearch
      ? [
          product.name,
          product.shortDescription,
          product.description,
          product.categorySlug,
          ...product.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      : true;

    return categoryMatch && searchMatch;
  });

  const chipFiltered = filterByChip(filtered, chip);
  return chipFiltered.sort(bySort(sort));
}

export function filterByChip(input: Product[], chip?: string) {
  if (!chip) return input;

  switch (chip) {
    case "new":
      return input.filter((product) => product.isNew);
    case "best-seller":
      return input.filter((product) => product.isBestSeller);
    case "under-3000":
      return input.filter((product) => product.price <= 3000);
    case "hydrating":
      return input.filter((product) =>
        product.tags.some((tag) => tag.toLowerCase().includes("hydrating")),
      );
    case "skincare":
      return input.filter((product) => product.categorySlug === "skincare");
    case "makeup":
      return input.filter((product) => product.categorySlug === "makeup");
    default:
      return input;
  }
}

export function getRelatedProducts(products: Product[], productId: string, limit = 4) {
  const selected = products.find((product) => product.id === productId);
  if (!selected) return [];

  return getActiveProducts(products)
    .filter(
      (product) =>
        product.id !== productId &&
        (product.categorySlug === selected.categorySlug ||
          product.tags.some((tag) => selected.tags.includes(tag))),
    )
    .slice(0, limit);
}

export function getActiveBanners(banners: Banner[]) {
  return banners
    .filter((banner) => banner.active && banner.isDeleted !== true)
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
}

export function validateCoupon(
  coupons: Coupon[],
  code: string,
  subtotal: number,
) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return {
      ok: false,
      message: "Enter a coupon code.",
      discountAmount: 0,
    };
  }

  const coupon = coupons.find((item) => item.code.toUpperCase() === normalized);
  if (!coupon || !coupon.active || coupon.isDeleted) {
    return {
      ok: false,
      message: "Coupon is invalid or inactive.",
      discountAmount: 0,
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return {
      ok: false,
      message: "Coupon has expired.",
      discountAmount: 0,
    };
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      message: `Minimum order is KES ${coupon.minSubtotal}.`,
      discountAmount: 0,
    };
  }

  if (coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
    return {
      ok: false,
      message: "Coupon usage limit reached.",
      discountAmount: 0,
    };
  }

  const discountAmount =
    coupon.type === "fixed"
      ? Math.min(coupon.value, subtotal)
      : Math.round((subtotal * coupon.value) / 100);

  return {
    ok: true,
    message: "Coupon applied successfully.",
    discountAmount,
    coupon,
  };
}

export function getOrderEventsForOrder(
  events: Array<{ orderId: string; createdAt: string; message: string; id: string }>,
  orderId: string,
) {
  return events
    .filter((event) => event.orderId === orderId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDeliveryQuote(
  counties: ServiceCounty[],
  towns: ServiceTown[],
  countyId: string,
  townId: string,
) {
  const county = counties.find((item) => item.id === countyId && item.isActive);
  const town = towns.find(
    (item) => item.id === townId && item.countyId === countyId && item.isActive,
  );

  if (!county || !town) {
    return {
      isServiceable: false,
      fee: 0,
      etaText: "Unavailable",
      countyName: county?.name ?? "",
      townName: town?.name ?? "",
    };
  }

  const etaText = formatEtaRange(town.etaMinValue, town.etaMaxValue, town.etaUnit);
  return {
    isServiceable: true,
    fee: town.deliveryFee ?? 0,
    etaText,
    countyName: county.name,
    townName: town.name,
    etaMinValue: town.etaMinValue,
    etaMaxValue: town.etaMaxValue,
    etaUnit: town.etaUnit,
  };
}

export function calculateOrderTotals(input: {
  subtotal: number;
  shippingFee: number;
  discount: number;
}) {
  const taxable = Math.max(input.subtotal - input.discount, 0);
  const tax = Math.round(taxable * 0.08);
  const total = taxable + input.shippingFee + tax;
  return {
    tax,
    total,
  };
}

export function canRequestRefund(order: Order) {
  return (
    order.status === "confirmed" ||
    order.status === "preparing" ||
    order.status === "left_shop" ||
    order.status === "in_transit" ||
    order.status === "out_for_delivery" ||
    order.status === "delivered"
  );
}
