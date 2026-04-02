import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand-900)] text-white",
        soft: "bg-[var(--brand-100)] text-[var(--brand-900)]",
        outline: "border border-[var(--border)] text-[var(--foreground-muted)]",
        success: "bg-[#e6f6ee] text-[#17683e]",
        warning: "bg-[#fff2e2] text-[#944100]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
