import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)] p-8 text-center", className)}>
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-900)]">
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--foreground-muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
