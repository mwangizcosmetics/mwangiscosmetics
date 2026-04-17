import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdminUser } from "@/lib/services/auth-server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    redirect("/admin/access?next=/admin");
  }

  return <AdminShell role={auth.profile.role}>{children}</AdminShell>;
}
