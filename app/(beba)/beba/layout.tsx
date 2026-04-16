import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireBebaUser } from "@/lib/services/auth-server";

export default async function BebaLayout({ children }: { children: ReactNode }) {
  const auth = await requireBebaUser();
  if (!auth.ok) {
    redirect("/auth/login?next=/beba");
  }

  return (
    <div className="min-h-screen bg-[var(--surface-alt)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
          MWANGIZ Delivery
        </p>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">BEBA Portal</h1>
      </header>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
