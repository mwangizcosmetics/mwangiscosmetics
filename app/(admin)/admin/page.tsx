"use client";

import { useMemo } from "react";

import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { useCommerceStore } from "@/lib/stores/commerce-store";

export default function AdminDashboardPage() {
  const orders = useCommerceStore((state) => state.orders);
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);

  const stats = useMemo(() => {
    const grossSales = orders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = orders.length;
    const avgOrder = orderCount ? Math.round(grossSales / orderCount) : 0;
    const activeProducts = products.filter((product) => product.isActive !== false).length;

    return [
      {
        id: "ast-sales",
        title: "Gross Sales",
        value: formatCurrency(grossSales),
        trend: "all orders",
        change: 12.4,
      },
      {
        id: "ast-orders",
        title: "Orders",
        value: String(orderCount),
        trend: "total orders",
        change: 8.2,
      },
      {
        id: "ast-aov",
        title: "Average Order",
        value: formatCurrency(avgOrder),
        trend: "based on totals",
        change: 3.1,
      },
      {
        id: "ast-active-products",
        title: "Active Products",
        value: String(activeProducts),
        trend: `${categories.filter((category) => category.isActive !== false).length} categories`,
        change: 0.7,
      },
    ];
  }, [categories, orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
        .slice(0, 8)
        .map((order) => [
          order.orderNumber,
          order.shippingAddress.fullName,
          order.status,
          formatCurrency(order.total),
          formatShortDate(order.placedAt),
        ]),
    [orders],
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <AdminTableShell
        title="Recent Orders"
        description="Latest customer purchases across all channels."
        columns={["Order #", "Customer", "Status", "Total", "Placed"]}
        rows={recentOrders}
        primaryActionLabel="View Orders"
      />
    </div>
  );
}
