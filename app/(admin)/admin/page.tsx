import { adminStats, adminTableSamples } from "@/lib/data/mock-data";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <AdminStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <AdminTableShell
        title="Recent Orders"
        description="Latest customer purchases across all channels."
        columns={["Order #", "Customer", "Status", "Total", "Placed"]}
        rows={adminTableSamples.orders.map((order) => [
          order.orderNumber,
          order.customer,
          order.status,
          formatCurrency(order.total),
          formatShortDate(order.placedAt),
        ])}
        primaryActionLabel="View Orders"
      />
    </div>
  );
}
