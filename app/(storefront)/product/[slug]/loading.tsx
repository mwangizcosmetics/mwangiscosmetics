import { SiteContainer } from "@/components/shared/site-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <SiteContainer className="space-y-6 py-6 sm:py-8">
      <Skeleton className="h-4 w-60" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <Skeleton className="h-[460px] w-full rounded-3xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-3xl" />
    </SiteContainer>
  );
}
