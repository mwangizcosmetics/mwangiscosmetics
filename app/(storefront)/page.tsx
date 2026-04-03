"use client";

import { useMemo } from "react";

import { HomeCategorySection } from "@/components/home/home-category-section";
import { HomeCuratedPicks } from "@/components/home/home-curated-picks";
import { HomeHero } from "@/components/home/home-hero";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { HomeProductSection } from "@/components/home/home-product-section";
import { HomePromoStrip } from "@/components/home/home-promo-strip";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { HomeTrustSection } from "@/components/home/home-trust-section";
import { useCommerceCatalog } from "@/lib/hooks/use-commerce-data";

export default function HomePage() {
  const { categories, products } = useCommerceCatalog();

  const categoriesWithCounts = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        productCount: products.filter((product) => product.categorySlug === category.slug).length,
      })),
    [categories, products],
  );

  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured).slice(0, 12),
    [products],
  );

  const bestSellerProducts = useMemo(
    () => products.filter((product) => product.isBestSeller).slice(0, 12),
    [products],
  );

  const newArrivalProducts = useMemo(
    () => products.filter((product) => product.isNew).slice(0, 12),
    [products],
  );

  return (
    <>
      <HomeHero />
      <HomeCategorySection categories={categoriesWithCounts} />
      <HomeProductSection
        eyebrow="Featured"
        title="Featured Products"
        description="Editor-approved beauty essentials for radiant everyday looks."
        products={featuredProducts}
      />
      <HomeProductSection
        eyebrow="Best Sellers"
        title="Best Sellers"
        description="Our most-loved formulas trusted by returning customers."
        products={bestSellerProducts}
      />
      <HomePromoStrip />
      <HomeProductSection
        eyebrow="Just Dropped"
        title="New Arrivals"
        description="Fresh additions to your skincare and makeup ritual."
        products={newArrivalProducts}
      />
      <HomeTrustSection />
      <HomeCuratedPicks />
      <HomeTestimonials />
      <HomeNewsletter />
    </>
  );
}
