import { Skeleton } from "@/components/ui/skeleton";

interface LoadingGridProps {
  count?: number;
}

export function LoadingGrid({ count = 6 }: LoadingGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-2xl border border-[var(--border)] bg-white p-2.5">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
