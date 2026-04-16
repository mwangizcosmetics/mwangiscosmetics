"use client";

import { useMemo } from "react";

import type { NormalizedRole } from "@/lib/services/rbac";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { useCommerceStore } from "@/lib/stores/commerce-store";

export function AdminDashboard({ role }: { role: NormalizedRole }) {
  const orders = useCommerceStore((state) => state.orders);
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);

  const stats = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === "success");
    const grossSales = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = orders.length;
    const avgOrder = paidOrders.length ? Math.round(grossSales / paidOrders.length) : 0;
    const activeProducts = products.filter((product) => product.isActive !== false).length;

    if (role === "super_admin") {
      return [
        {
          id: "ast-sales",
          title: "Gross Sales",
          value: formatCurrency(grossSales),
          trend: "paid orders",
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
    }

    return [
      {
        id: "ast-orders",
        title: "Orders",
        value: String(orderCount),
        trend: "total orders",
        change: 8.2,
      },
      {
        id: "ast-active-products",
        title: "Active Products",
        value: String(activeProducts),
        trend: `${categories.filter((category) => category.isActive !== false).length} categories`,
        change: 0.7,
      },
      {
        id: "ast-paid-orders",
        title: "Paid Orders",
        value: String(paidOrders.length),
        trend: "ready for dispatch",
        change: 4.6,
      },
    ];
  }, [categories, orders, products, role]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
        .slice(0, 8)
        .map((order) => [
          order.orderNumber,
          order.shippingAddress.fullName,
          order.status,
          role === "super_admin" ? formatCurrency(order.total) : "Restricted",
          formatShortDate(order.placedAt),
        ]),
    [orders, role],
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
