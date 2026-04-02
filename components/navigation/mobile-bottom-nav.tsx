"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileBottomNav } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/stores/cart-store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur sm:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {mobileBottomNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const count = item.href === "/cart" ? cartCount : 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition",
                  active ? "text-[var(--brand-900)]" : "text-[var(--foreground-muted)]",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
                {count > 0 ? (
                  <span className="absolute right-[26%] top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--brand-900)] px-1 text-[10px] text-white">
                    {count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
