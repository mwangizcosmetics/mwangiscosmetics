import { redirect } from "next/navigation";

import { adminTableSamples } from "@/lib/data/mock-data";
import { formatCurrency } from "@/lib/utils/format";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { requirePermission } from "@/lib/services/auth-server";

export default async function AdminCustomersPage() {
  const auth = await requirePermission("admin:customers");
  if (!auth.ok) {
    redirect("/admin");
  }

  return (
    <AdminTableShell
      title="Customers"
      description="Review customer segments, spending, and retention profile."
      columns={["Name", "Email", "Orders", "Lifetime Spend", "Segment"]}
      rows={adminTableSamples.customers.map((customer) => [
        customer.name,
        customer.email,
        String(customer.orders),
        formatCurrency(customer.lifetimeSpend),
        customer.segment,
      ])}
      primaryActionLabel="Export Customers"
    />
  );
}
