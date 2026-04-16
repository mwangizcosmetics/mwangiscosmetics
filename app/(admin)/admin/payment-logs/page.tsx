import { redirect } from "next/navigation";

import { PaymentLogsManager } from "@/components/admin/payment-logs-manager";
import { requirePermission } from "@/lib/services/auth-server";
import { getPaymentLogsFromSupabase } from "@/lib/services/payments/payment-log-server";

export default async function AdminPaymentLogsPage() {
  const auth = await requirePermission("admin:payment_logs");
  if (!auth.ok) {
    redirect("/admin");
  }

  const logs = await getPaymentLogsFromSupabase();
  return <PaymentLogsManager logs={logs} />;
}
