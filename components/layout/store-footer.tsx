import Link from "next/link";

import { brand } from "@/lib/constants/brand";
import { SiteContainer } from "@/components/shared/site-container";

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Skincare", href: "/category/skincare" },
      { label: "Makeup", href: "/category/makeup" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", href: "/orders" },
      { label: "Shipping", href: "/checkout" },
      { label: "Returns", href: "/account" },
      { label: "Contact", href: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About MWANGIZ", href: "/" },
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Careers", href: "/" },
    ],
  },
];

export function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface-alt)] pb-28 pt-10 sm:pb-10">
      <SiteContainer className="space-y-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-base font-semibold tracking-[0.1em]">{brand.name}</p>
            <p className="text-sm text-[var(--foreground-muted)]">{brand.tagline}</p>
            <div className="text-sm text-[var(--foreground-muted)]">
              <p>{brand.email}</p>
              <p>{brand.phone}</p>
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--foreground)]">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] pt-6 text-xs text-[var(--foreground-subtle)]">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
        </div>
      </SiteContainer>
    </footer>
  );
}
