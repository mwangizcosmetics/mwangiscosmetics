import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { products } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductDetailsTabs } from "@/components/product/product-details-tabs";
import { RelatedProducts } from "@/components/product/related-products";
import { getProductPageData } from "@/lib/services/catalog-service";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const productData = await getProductPageData(slug);

  if (!productData) {
    notFound();
  }

  const { product, relatedProducts, reviews } = productData;

  return (
    <SiteContainer className="space-y-8 py-6 sm:py-8">
      <nav className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
        <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/shop" className="hover:text-[var(--foreground)]">Shop</Link>
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
