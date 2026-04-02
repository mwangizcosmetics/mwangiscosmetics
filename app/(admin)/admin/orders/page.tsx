import { adminTableSamples } from "@/lib/data/mock-data";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminOrdersPage() {
  return (
    <AdminTableShell
      title="Order Management"
      description="Monitor fulfillment progress and customer delivery outcomes."
      columns={["Order #", "Customer", "Status", "Total", "Placed"]}
      rows={adminTableSamples.orders.map((order) => [
        order.orderNumber,
        order.customer,
        order.status,
        formatCurrency(order.total),
        formatShortDate(order.placedAt),
      ])}
      primaryActionLabel="Export Orders"
    />
  );
}
