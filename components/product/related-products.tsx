import type { Product } from "@/lib/types/ecommerce";
import { ProductCard } from "@/components/shop/product-card";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">You may also like</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 [&>*]:h-full">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
