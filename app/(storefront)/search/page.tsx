"use client";

import { SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SearchInput } from "@/components/shared/search-input";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { useShopProducts } from "@/lib/hooks/use-commerce-data";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const products = useShopProducts({ search: q });

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Search"
        title={q ? `Results for "${q}"` : "Search Products"}
        description="Find your next beauty essentials by name, concern, or category."
      />
      <SearchInput defaultValue={q} className="max-w-xl" />
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <SiteContainer className="space-y-5 py-6 sm:py-8">
          <SectionHeading
            eyebrow="Search"
            title="Search Products"
            description="Loading search experience..."
          />
        </SiteContainer>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
