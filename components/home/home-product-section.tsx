import type { Product } from "@/lib/types/ecommerce";

import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteContainer } from "@/components/shared/site-container";

interface HomeProductSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  products: Product[];
}

export function HomeProductSection({
  eyebrow,
  title,
  description,
  actionHref = "/shop",
  actionLabel = "View all",
  products,
}: HomeProductSectionProps) {
  return (
    <section className="py-8 sm:py-12">
      <SiteContainer className="space-y-5">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          actionHref={actionHref}
          actionLabel={actionLabel}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
