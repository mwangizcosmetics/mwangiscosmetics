"use client";

import Link from "next/link";
import { useMemo } from "react";

import { sampleProfile } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";
import { AccountOverviewCard } from "@/components/account/account-overview-card";
import { OrderListItem } from "@/components/account/order-list-item";
import { AddressBook } from "@/components/account/address-book";
import { useCommerceStore } from "@/lib/stores/commerce-store";

export default function AccountPage() {
  const orders = useCommerceStore((state) => state.orders);
  const recentOrders = useMemo(
    () =>
      [...orders]
        .filter((order) => order.userId === sampleProfile.id)
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
        .slice(0, 2),
    [orders],
  );

  return (
    <SiteContainer className="space-y-5 py-6 sm:py-8">
      <AccountOverviewCard profile={sampleProfile} />

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent orders</h2>
          <Link href="/orders" className="text-sm font-medium text-[var(--brand-900)] hover:text-[var(--brand-700)]">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {recentOrders.map((order) => (
            <OrderListItem key={order.id} order={order} />
          ))}
        </div>
      </section>
      <AddressBook userId={sampleProfile.id} />
    </SiteContainer>
  );
}
