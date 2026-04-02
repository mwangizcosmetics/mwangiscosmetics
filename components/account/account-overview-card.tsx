import Link from "next/link";
import { Heart, MapPinHouse, Package } from "lucide-react";

import type { UserProfile } from "@/lib/types/ecommerce";
import { Button } from "@/components/ui/button";

interface AccountOverviewCardProps {
  profile: UserProfile;
}

export function AccountOverviewCard({ profile }: AccountOverviewCardProps) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Account</p>
      <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">Welcome back, {profile.fullName.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{profile.email}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Link href="/orders" className="rounded-2xl border border-[var(--border)] bg-white p-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-50)]">
          <Package className="mb-2 size-4 text-[var(--brand-700)]" />
          Track orders
        </Link>
        <Link href="/wishlist" className="rounded-2xl border border-[var(--border)] bg-white p-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-50)]">
          <Heart className="mb-2 size-4 text-[var(--brand-700)]" />
          Saved items
        </Link>
        <Link href="/account#addresses" className="rounded-2xl border border-[var(--border)] bg-white p-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-50)]">
          <MapPinHouse className="mb-2 size-4 text-[var(--brand-700)]" />
          Addresses
        </Link>
      </div>
      <div className="mt-4">
        <Button variant="outline" className="rounded-full">Manage Profile</Button>
      </div>
    </section>
  );
}
