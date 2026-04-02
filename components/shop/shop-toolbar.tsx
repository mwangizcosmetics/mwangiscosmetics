"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { quickFilterChips, sortOptions } from "@/lib/constants/shop";
import { useUiStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/types/ecommerce";

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };
}

interface ShopToolbarProps {
  categories: Pick<Category, "slug" | "name">[];
}

export function ShopToolbar({ categories }: ShopToolbarProps) {
  const setFilterDrawerOpen = useUiStore((state) => state.setFilterDrawerOpen);
  const isFilterDrawerOpen = useUiStore((state) => state.isFilterDrawerOpen);
  const searchParams = useSearchParams();
  const updateQuery = useQueryUpdater();

  const currentSort = searchParams.get("sort") ?? "featured";
  const currentCategory = searchParams.get("category") ?? "";
  const currentChip = searchParams.get("chip") ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sheet open={isFilterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 rounded-full">
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Refine products</SheetTitle>
              <SheetDescription>Filter by category and curated preferences.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-muted)]">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuery({ category: undefined })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      !currentCategory ? "bg-[var(--brand-900)] text-white" : "bg-[var(--brand-100)] text-[var(--brand-900)]"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => updateQuery({ category: category.slug })}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        currentCategory === category.slug
                          ? "bg-[var(--brand-900)] text-white"
                          : "bg-[var(--brand-100)] text-[var(--brand-900)]"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-muted)]">Quick tags</p>
                <div className="flex flex-wrap gap-2">
                  {quickFilterChips.map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => updateQuery({ chip: currentChip === chip.value ? undefined : chip.value })}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        currentChip === chip.value
                          ? "bg-[var(--brand-900)] text-white"
                          : "bg-[var(--brand-100)] text-[var(--brand-900)]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-auto w-44">
          <Select value={currentSort} onValueChange={(value) => updateQuery({ sort: value })}>
            <SelectTrigger className="h-10 rounded-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1">
        {quickFilterChips.map((chip) => (
          <button key={chip.value} type="button" onClick={() => updateQuery({ chip: currentChip === chip.value ? undefined : chip.value })}>
            <Badge variant={currentChip === chip.value ? "default" : "outline"} className="whitespace-nowrap px-3 py-1.5 text-xs">
              {chip.label}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
