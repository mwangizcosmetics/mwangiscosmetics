import * as React from "react";

import { cn } from "@/lib/utils/cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[110px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm shadow-xs outline-none transition",
        "placeholder:text-[var(--foreground-subtle)] focus-visible:border-[var(--brand-500)] focus-visible:ring-2 focus-visible:ring-[var(--brand-200)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
