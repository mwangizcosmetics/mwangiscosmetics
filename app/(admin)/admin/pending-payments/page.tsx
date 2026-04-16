import { redirect } from "next/navigation";

import { PendingPaymentsManager } from "@/components/admin/pending-payments-manager";
import { requirePermission } from "@/lib/services/auth-server";

export default async function AdminPendingPaymentsPage() {
  const auth = await requirePermission("admin:financials");
  if (!auth.ok) {
    redirect("/admin");
  }

  return <PendingPaymentsManager />;
}
