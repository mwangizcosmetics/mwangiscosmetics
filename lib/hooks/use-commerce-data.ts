"use client";

import { useMemo } from "react";

import {
  getActiveBanners,
  getActiveCategories,
  getActiveProducts,
  queryProducts,
  type ProductSort,
} from "@/lib/services/commerce-selectors";
import { useCommerceStore } from "@/lib/stores/commerce-store";

export function useCommerceCatalog() {
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const banners = useCommerceStore((state) => state.banners);

  const activeCategories = useMemo(
    () => getActiveCategories(categories),
    [categories],
  );
  const activeProducts = useMemo(() => getActiveProducts(products), [products]);
  const activeBanners = useMemo(() => getActiveBanners(banners), [banners]);

  return {
    hasHydrated,
    categories: activeCategories,
    products: activeProducts,
    banners: activeBanners,
  };
}

export function useShopProducts(filters: {
  search?: string;
  category?: string;
  chip?: string;
  sort?: ProductSort;
}) {
  const products = useCommerceStore((state) => state.products);
  return queryProducts(products, filters);
}
