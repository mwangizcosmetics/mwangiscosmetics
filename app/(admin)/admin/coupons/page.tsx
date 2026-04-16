import { redirect } from "next/navigation";

import { CouponsManager } from "@/components/admin/coupons-manager";
import { requirePermission } from "@/lib/services/auth-server";

export default async function AdminCouponsPage() {
  const auth = await requirePermission("admin:coupons");
  if (!auth.ok) {
    redirect("/admin");
  }

  return <CouponsManager />;
}
