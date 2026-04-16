import { redirect } from "next/navigation";

import { StaffManager } from "@/components/admin/staff-manager";
import { requireSuperAdminUser } from "@/lib/services/auth-server";

export default async function AdminStaffPage() {
  const auth = await requireSuperAdminUser();
  if (!auth.ok) {
    redirect("/admin");
  }

  return <StaffManager />;
}
