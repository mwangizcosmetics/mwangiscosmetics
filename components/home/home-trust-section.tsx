import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";

import { SiteContainer } from "@/components/shared/site-container";

const trustItems = [
  {
    title: "Authenticity Guaranteed",
    description: "Only verified and quality-checked products from trusted partners.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Delivery",
    description: "Same-day dispatch for confirmed orders and reliable tracking updates.",
    icon: Truck,
  },
  {
    title: "Beauty Expert Support",
    description: "Personalized routine recommendations and order support from our care team.",
    icon: BadgeCheck,
  },
];

export function HomeTrustSection() {
  return (
    <section className="py-8 sm:py-12">
      <SiteContainer>
        <div className="grid gap-3 sm:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[var(--brand-100)] text-[var(--brand-900)]">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </SiteContainer>
    </section>
  );
}
