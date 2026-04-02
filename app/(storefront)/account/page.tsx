import { MapPinned } from "lucide-react";
import Link from "next/link";

import { sampleOrders, sampleProfile } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";
import { AccountOverviewCard } from "@/components/account/account-overview-card";
import { OrderListItem } from "@/components/account/order-list-item";

export default function AccountPage() {
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
          {sampleOrders.slice(0, 2).map((order) => (
            <OrderListItem key={order.id} order={order} />
          ))}
        </div>
      </section>

      <section id="addresses" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center gap-2">
          <MapPinned className="size-4 text-[var(--brand-700)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Saved addresses</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {sampleProfile.savedAddresses.map((address, index) => (
            <article key={`${address.line1}-${index}`} className="rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--foreground-muted)]">
              <p className="font-semibold text-[var(--foreground)]">{address.fullName}</p>
              <p className="mt-1">{address.line1}</p>
              {address.line2 ? <p>{address.line2}</p> : null}
              <p>
                {address.city}, {address.region}
              </p>
              <p>{address.country}</p>
              <p className="mt-1">{address.phone}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteContainer>
  );
}
