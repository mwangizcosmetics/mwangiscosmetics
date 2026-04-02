import { HomeCategorySection } from "@/components/home/home-category-section";
import { HomeCuratedPicks } from "@/components/home/home-curated-picks";
import { HomeHero } from "@/components/home/home-hero";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { HomeProductSection } from "@/components/home/home-product-section";
import { HomePromoStrip } from "@/components/home/home-promo-strip";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { HomeTrustSection } from "@/components/home/home-trust-section";
import { getHomeCatalogData } from "@/lib/services/catalog-service";

export const revalidate = 120;

export default async function HomePage() {
  const { categories, featuredProducts, bestSellerProducts, newArrivalProducts } =
    await getHomeCatalogData();

  return (
    <>
      <HomeHero />
      <HomeCategorySection categories={categories} />
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
