import { SearchX } from "lucide-react";

import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SearchInput } from "@/components/shared/search-input";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getShopProducts } from "@/lib/services/catalog-service";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const products = await getShopProducts({ search: q });

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Search"
        title={q ? `Results for "${q}"` : "Search Products"}
        description="Find your next beauty essentials by name, concern, or category."
      />
      <SearchInput defaultValue={q ?? ""} className="max-w-xl" />
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          icon={SearchX}
          title="No search matches"
          description="Try broader keywords or browse our curated categories."
          actionLabel="Browse shop"
          actionHref="/shop"
        />
      )}
    </SiteContainer>
  );
}
