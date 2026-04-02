import type { Product } from "@/lib/types/ecommerce";
import { ProductCard } from "@/components/shop/product-card";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">You may also like</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
