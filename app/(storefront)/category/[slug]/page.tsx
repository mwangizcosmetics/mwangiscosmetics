"use client";

import { useParams, useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/shop/product-grid";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { useCommerceCatalog, useShopProducts } from "@/lib/hooks/use-commerce-data";
import type { ProductSort } from "@/lib/services/commerce-selectors";
import { SearchX } from "lucide-react";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { categories } = useCommerceCatalog();

  const slug = params.slug;
  const category = categories.find((item) => item.slug === slug);

  const products = useShopProducts({
    search: searchParams.get("q") ?? undefined,
    sort: (searchParams.get("sort") as ProductSort | null) ?? undefined,
    chip: searchParams.get("chip") ?? undefined,
    category: slug,
  });

  if (!category) {
    return (
      <SiteContainer className="py-6 sm:py-8">
        <EmptyState
          icon={SearchX}
          title="Category unavailable"
          description="This category is inactive or does not exist."
          actionLabel="Back to shop"
          actionHref="/shop"
        />
      </SiteContainer>
    );
  }

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Category"
        title={category.name}
        description={category.description}
      />
      <ShopToolbar categories={categories} />
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          icon={SearchX}
          title="No products in this category"
          description="Try clearing filters or activate more products in this category."
          actionLabel="Clear filters"
          actionHref={`/category/${category.slug}`}
        />
      )}
    </SiteContainer>
  );
}
