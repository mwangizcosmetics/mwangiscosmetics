"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminSidebarNav } from "@/lib/constants/navigation";
import { hasPermission, type NormalizedRole } from "@/lib/services/rbac";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar({ role }: { role: NormalizedRole }) {
  const pathname = usePathname();
  const visibleNavItems = adminSidebarNav.filter((item) =>
    hasPermission(role, item.requiredPermission),
  );

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-5 lg:block">
      <Link href="/admin" className="mb-8 block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">Admin Panel</p>
        <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">MWANGIZ Cosmetics</p>
      </Link>
      <nav>
        <ul className="space-y-1">
          {visibleNavItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[var(--brand-100)] text-[var(--brand-900)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--brand-50)] hover:text-[var(--foreground)]",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
