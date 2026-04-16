import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdminUser } from "@/lib/services/auth-server";

export default async function AdminDashboardPage() {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    redirect("/auth/login?next=/admin");
  }

  return <AdminDashboard role={auth.profile.role} />;
}
