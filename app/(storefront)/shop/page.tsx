import { SearchX } from "lucide-react";

import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteContainer } from "@/components/shared/site-container";
import { EmptyState } from "@/components/shared/empty-state";
import { type ProductSort } from "@/lib/services/product-service";
import { getShopProducts, getStoreCategories } from "@/lib/services/catalog-service";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: ProductSort;
    chip?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getShopProducts({
      search: params.q,
      category: params.category,
      sort: params.sort,
      chip: params.chip,
    }),
    getStoreCategories(),
  ]);

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
              : "Product catalog is currently empty. Seed products to begin browsing."
          }
          actionLabel="Clear filters"
          actionHref="/shop"
        />
      )}
    </SiteContainer>
  );
}
