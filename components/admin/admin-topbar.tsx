"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminTopbar() {
  const pathname = usePathname();
  const title = pathname.replace("/admin", "").split("/").filter(Boolean).join(" / ") || "overview";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">MWANGIZ Admin</p>
          <h1 className="text-lg font-semibold capitalize text-[var(--foreground)]">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 grow sm:grow-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input placeholder="Search products, orders..." className="h-10 rounded-xl pl-9" />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
            <Bell className="size-4" />
          </Button>
          <Button asChild className="h-10 rounded-xl">
            <Link href="/admin/products">
              <Plus className="size-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
