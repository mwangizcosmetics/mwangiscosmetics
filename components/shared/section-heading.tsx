import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-[var(--foreground-muted)]">{description}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="hidden items-center gap-1 text-sm font-medium text-[var(--brand-900)] transition hover:text-[var(--brand-700)] sm:inline-flex">
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
