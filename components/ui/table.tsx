import * as React from "react";

import { cn } from "@/lib/utils/cn";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("bg-[var(--brand-50)] [&_tr]:border-b [&_tr]:border-[var(--border)]", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("border-b border-[var(--border)] transition hover:bg-[var(--brand-50)]/70", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn("h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle text-[13px]", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-sm text-[var(--foreground-muted)]", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption };
