import type { ReactNode } from "react";

import { AdminMagicPendingRedirect } from "@/components/auth/admin-magic-pending-redirect";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <StorefrontShell>
      <AdminMagicPendingRedirect />
      {children}
    </StorefrontShell>
  );
}
