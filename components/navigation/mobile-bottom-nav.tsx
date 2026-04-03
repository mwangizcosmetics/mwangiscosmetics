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
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative mx-1 my-1 flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition",
                  active
                    ? "bg-[var(--brand-50)] text-[var(--brand-900)]"
                    : "text-[var(--foreground-muted)]",
                )}
              >
                {active ? (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[var(--brand-700)]" />
                ) : null}
                <Icon className="size-[18px]" />
                <span>{item.label}</span>
                {count > 0 ? (
                  <span className="absolute right-[18%] top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--brand-900)] px-1 text-[10px] text-white">
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
