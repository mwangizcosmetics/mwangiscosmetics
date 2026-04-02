import { adminTableSamples } from "@/lib/data/mock-data";
import { formatCurrency } from "@/lib/utils/format";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminCustomersPage() {
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
