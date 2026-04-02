import { notFound } from "next/navigation";

import { categories as mockCategories } from "@/lib/data/mock-data";
import { type ProductSort } from "@/lib/services/product-service";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCategoryPageData } from "@/lib/services/catalog-service";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    sort?: ProductSort;
    chip?: string;
  }>;
}

export function generateStaticParams() {
  return mockCategories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const categoryData = await getCategoryPageData(slug, {
    search: query.q,
    sort: query.sort,
    chip: query.chip,
  });

  if (!categoryData.category) {
    notFound();
  }

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <SectionHeading
        eyebrow="Category"
        title={categoryData.category.name}
        description={categoryData.category.description}
      />
      <ShopToolbar categories={categoryData.categories} />
      <ProductGrid products={categoryData.products} />
    </SiteContainer>
  );
}
