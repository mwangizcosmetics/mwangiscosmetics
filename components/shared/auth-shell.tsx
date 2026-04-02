import type { ReactNode } from "react";
import Link from "next/link";

import { brand } from "@/lib/constants/brand";

interface AuthShellProps {
  title: string;
  description: string;
  alternateLabel: string;
  alternateHref: string;
  children: ReactNode;
}

export function AuthShell({
  title,
  description,
  alternateLabel,
  alternateHref,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(70%_45%_at_100%_0%,rgba(166,127,110,0.16),transparent_70%),radial-gradient(50%_35%_at_0%_30%,rgba(233,214,202,0.6),transparent_70%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-md space-y-6">
        <Link href="/" className="block text-center text-sm font-semibold tracking-[0.12em] text-[var(--foreground)]">
          {brand.name}
        </Link>
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{description}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
            {alternateLabel}{" "}
            <Link href={alternateHref} className="font-semibold text-[var(--brand-900)] hover:text-[var(--brand-700)]">
              Continue here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
