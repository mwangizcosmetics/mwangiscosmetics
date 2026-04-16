import { redirect } from "next/navigation";

import { DiscountsManager } from "@/components/admin/discounts-manager";
import { requirePermission } from "@/lib/services/auth-server";

export default async function AdminDiscountsPage() {
  const auth = await requirePermission("admin:discounts");
  if (!auth.ok) {
    redirect("/admin");
  }

  return <DiscountsManager />;
}
