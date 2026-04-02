import { LoadingGrid } from "@/components/shared/loading-grid";
import { SiteContainer } from "@/components/shared/site-container";

export default function ShopLoading() {
  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-[var(--brand-100)]" />
        <div className="h-8 w-52 rounded-2xl bg-[var(--brand-100)]" />
      </div>
      <LoadingGrid count={8} />
    </SiteContainer>
  );
}
