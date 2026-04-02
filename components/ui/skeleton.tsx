import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-2xl bg-[var(--brand-100)]/80", className)} {...props} />;
}

export { Skeleton };
