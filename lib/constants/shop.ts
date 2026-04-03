export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Best Selling", value: "best-selling" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating-desc" },
];

export const quickFilterChips = [
  { label: "New", value: "new" },
  { label: "Best Sellers", value: "best-seller" },
  { label: "Under KES 3,000", value: "under-3000" },
  { label: "Hydration", value: "hydrating" },
  { label: "Skincare", value: "skincare" },
  { label: "Makeup", value: "makeup" },
];

export const orderStatusDisplay = {
  pending: "Pending",
  confirmed: "Confirmed",
  paid: "Paid",
  preparing: "Preparing",
  left_shop: "Left Shop",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
} as const;
