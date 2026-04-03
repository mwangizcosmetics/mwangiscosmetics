"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, SearchX } from "lucide-react";

import { getReviewsForProduct } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductDetailsTabs } from "@/components/product/product-details-tabs";
import { RelatedProducts } from "@/components/product/related-products";
import { EmptyState } from "@/components/shared/empty-state";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { getRelatedProducts } from "@/lib/services/commerce-selectors";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const products = useCommerceStore((state) => state.products);

  const product = useMemo(
    () => products.find((item) => item.slug === params.slug && item.isActive !== false),
    [params.slug, products],
  );

  if (!product) {
    return (
      <SiteContainer className="py-6 sm:py-8">
        <EmptyState
          icon={SearchX}
          title="Product unavailable"
          description="This product is inactive or could not be found."
          actionLabel="Back to shop"
          actionHref="/shop"
        />
      </SiteContainer>
    );
  }

  const relatedProducts = getRelatedProducts(products, product.id, 8);
  const reviews = getReviewsForProduct(product.id);

  return (
    <SiteContainer className="space-y-8 py-6 sm:py-8">
      <nav className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/shop" className="hover:text-[var(--foreground)]">
          Shop
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-[var(--foreground-muted)]">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductPurchasePanel product={product} />
      </div>

      <ProductDetailsTabs product={product} reviews={reviews} />
      <RelatedProducts products={relatedProducts} />
    </SiteContainer>
  );
}
