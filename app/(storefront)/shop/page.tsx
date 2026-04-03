"use client";

import { SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteContainer } from "@/components/shared/site-container";
import { EmptyState } from "@/components/shared/empty-state";
import { useCommerceCatalog, useShopProducts } from "@/lib/hooks/use-commerce-data";
import type { ProductSort } from "@/lib/services/commerce-selectors";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { categories } = useCommerceCatalog();

  const params = useMemo(
    () => ({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      sort: (searchParams.get("sort") as ProductSort | null) ?? undefined,
      chip: searchParams.get("chip") ?? undefined,
    }),
    [searchParams],
  );

  const products = useShopProducts({
    search: params.q,
    category: params.category,
    sort: params.sort,
    chip: params.chip,
  });

  const hasFilters = Boolean(params.q || params.category || params.chip);

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Catalog"
        title="Shop All Products"
        description="Browse premium beauty picks with mobile-first filtering and sorting."
      />
      <ShopToolbar categories={categories} />
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? "No products found" : "Catalog unavailable"}
          description={
            hasFilters
              ? "Adjust your search or filters to discover more beauty products."
              : "Product catalog is currently empty. Add active products in admin to begin browsing."
          }
          actionLabel="Clear filters"
          actionHref="/shop"
        />
      )}
    </SiteContainer>
  );
}
