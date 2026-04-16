import { redirect } from "next/navigation";

import { DeliveryOpsManager } from "@/components/admin/delivery-ops-manager";
import { requirePermission } from "@/lib/services/auth-server";

export default async function AdminDeliveryPage() {
  const auth = await requirePermission("admin:delivery_management");
  if (!auth.ok) {
    redirect("/auth/login?next=/admin/delivery");
  }

  return <DeliveryOpsManager role={auth.profile.role} />;
}
