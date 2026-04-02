import type { Category } from "@/lib/types/ecommerce";
import { CategoryCard } from "@/components/shop/category-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteContainer } from "@/components/shared/site-container";

interface HomeCategorySectionProps {
  categories: Category[];
}

export function HomeCategorySection({ categories }: HomeCategorySectionProps) {
  return (
    <section id="categories" className="py-8 sm:py-12">
      <SiteContainer className="space-y-5">
        <SectionHeading
          eyebrow="Discover"
          title="Shop by Category"
          description="Browse premium edits across skincare, makeup, body care, and more."
          actionLabel="View all categories"
          actionHref="/shop"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
