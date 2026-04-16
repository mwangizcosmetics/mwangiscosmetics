import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { NormalizedRole } from "@/lib/services/rbac";

export function AdminShell({
  children,
  role,
}: {
  children: ReactNode;
  role: NormalizedRole;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface-alt)] lg:flex">
      <AdminSidebar role={role} />
      <div className="min-w-0 flex-1">
        <AdminTopbar role={role} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
