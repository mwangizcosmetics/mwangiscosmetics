import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SiteContainer } from "@/components/shared/site-container";

const curatedPicks = [
  {
    title: "Radiance Reset",
    description: "Cleanser, serum, and SPF essentials for a brighter routine.",
    href: "/shop?chip=hydrating",
  },
  {
    title: "Soft Glam Kit",
    description: "Foundation, lip oil, and brushes for effortless daily glam.",
    href: "/category/makeup",
  },
  {
    title: "Night Repair Edit",
    description: "Overnight hydration and repair must-haves for next-day glow.",
    href: "/category/skincare",
  },
];

export function HomeCuratedPicks() {
  return (
    <section className="py-8 sm:py-12">
      <SiteContainer>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Curated Picks</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Beauty essentials by routine</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {curatedPicks.map((pick, index) => (
            <Link
              key={pick.title}
              href={pick.href}
              className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] transition hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                Edit {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{pick.title}</h3>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">{pick.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-900)]">
                Shop edit
                <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
