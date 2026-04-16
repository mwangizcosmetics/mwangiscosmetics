"use client";

import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import type { DiscountRule } from "@/lib/types/ecommerce";
import { formatShortDate } from "@/lib/utils/format";
import { adminDiscountSchema } from "@/lib/validators/admin";

function latestRule<T extends DiscountRule>(rules: T[]) {
  return [...rules].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function DiscountsManager() {
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const discountRules = useCommerceStore((state) => state.discountRules);
  const discountAuditLogs = useCommerceStore((state) => state.discountAuditLogs);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const upsertDiscountRule = useCommerceStore((state) => state.upsertDiscountRule);
  const removeDiscountRule = useCommerceStore((state) => state.removeDiscountRule);

  const [globalPercent, setGlobalPercent] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});
  const [productDrafts, setProductDrafts] = useState<Record<string, string>>({});
  const [productSearch, setProductSearch] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive !== false),
    [products],
  );

  const globalRule = useMemo(
    () => latestRule(discountRules.filter((rule) => rule.scope === "global")),
    [discountRules],
  );

  const categoryRuleBySlug = useMemo(() => {
    const entries = categories.map((category) => {
      const rule = latestRule(
        discountRules.filter(
          (candidate) =>
            candidate.scope === "category" &&
            candidate.targetCategorySlug === category.slug,
        ),
      );
      return [category.slug, rule] as const;
    });
    return new Map(entries);
  }, [categories, discountRules]);

  const productRuleById = useMemo(() => {
    const entries = activeProducts.map((product) => {
      const rule = latestRule(
        discountRules.filter(
          (candidate) =>
            candidate.scope === "product" && candidate.targetProductId === product.id,
        ),
      );
      return [product.id, rule] as const;
    });
    return new Map(entries);
  }, [activeProducts, discountRules]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return activeProducts
      .filter((product) => {
        if (!query) return true;
        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query)
        );
      })
      .slice(0, 60);
  }, [activeProducts, productSearch]);

  const applyRule = (payload: {
    scope: "global" | "category" | "product";
    percentInput: string;
    targetCategorySlug?: string;
    targetProductId?: string;
  }) => {
    const parsedPercent = Number(payload.percentInput);
    const parsed = adminDiscountSchema.safeParse({
      scope: payload.scope,
      percent: parsedPercent,
      targetCategorySlug: payload.targetCategorySlug,
      targetProductId: payload.targetProductId,
      isActive: true,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid discount value.");
      return;
    }

    const affectedCount =
      payload.scope === "global"
        ? activeProducts.length
        : payload.scope === "category"
          ? activeProducts.filter(
              (product) => product.categorySlug === payload.targetCategorySlug,
            ).length
          : activeProducts.filter((product) => product.id === payload.targetProductId).length;

    let existingRule: DiscountRule | undefined;
    if (payload.scope === "global") {
      existingRule = globalRule;
    } else if (payload.scope === "category") {
      existingRule = categoryRuleBySlug.get(payload.targetCategorySlug ?? "");
    } else {
      existingRule = productRuleById.get(payload.targetProductId ?? "");
    }

    if (existingRule) {
      const proceed = window.confirm(
        `Overwrite existing ${existingRule.percent}% ${payload.scope} discount? This affects ${affectedCount} product(s).`,
      );
      if (!proceed) return;
    }

    const result = upsertDiscountRule(parsed.data);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to apply discount.");
      return;
    }

    toast.success(`Discount applied to ${affectedCount} product(s).`);
  };

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Discounts</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading discount rules...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Discount Management</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Priority: Product discount, then Category, then Global. Discounts never stack.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Store-wide Discount</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Affects {activeProducts.length} active products.
            </p>
          </div>
          {globalRule ? (
            <Badge variant={globalRule.isActive ? "default" : "warning"}>
              {globalRule.percent}% {globalRule.isActive ? "Active" : "Inactive"}
            </Badge>
          ) : (
            <Badge variant="outline">No Rule</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={globalPercent}
            onChange={(event) => setGlobalPercent(event.target.value)}
            placeholder={globalRule ? `${globalRule.percent}` : "e.g. 10"}
            type="number"
            min={0}
            max={100}
            className="h-9 w-36 rounded-xl"
          />
          <Button
            size="sm"
            className="h-9 rounded-xl"
            onClick={() =>
              applyRule({
                scope: "global",
                percentInput: globalPercent || String(globalRule?.percent ?? ""),
              })
            }
          >
            Apply Discount to All Products
          </Button>
          {globalRule ? (
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-xl"
              onClick={() => {
                const result = upsertDiscountRule({
                  scope: "global",
                  percent: globalRule.percent,
                  isActive: !globalRule.isActive,
                });
                if (!result.ok) {
                  toast.error(result.message ?? "Unable to toggle global discount.");
                  return;
                }
                toast.success(globalRule.isActive ? "Global discount disabled." : "Global discount enabled.");
              }}
            >
              {globalRule.isActive ? "Disable" : "Enable"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">Category Discounts</p>
        {categories.map((category) => {
          const rule = categoryRuleBySlug.get(category.slug);
          const affectedCount = activeProducts.filter(
            (product) => product.categorySlug === category.slug,
          ).length;
          return (
            <div
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">{category.name}</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {affectedCount} product(s) • {rule ? `${rule.percent}%` : "No rule"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={categoryDrafts[category.slug] ?? ""}
                  onChange={(event) =>
                    setCategoryDrafts((current) => ({
                      ...current,
                      [category.slug]: event.target.value,
                    }))
                  }
                  type="number"
                  min={0}
                  max={100}
                  placeholder={rule ? String(rule.percent) : "10"}
                  className="h-8 w-24 rounded-xl"
                />
                <Button
                  size="sm"
                  className="h-8 rounded-xl"
                  onClick={() =>
                    applyRule({
                      scope: "category",
                      targetCategorySlug: category.slug,
                      percentInput:
                        categoryDrafts[category.slug] || String(rule?.percent ?? ""),
                    })
                  }
                >
                  Apply to Category
                </Button>
                {rule ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-xl"
                    onClick={() => {
                      const result = removeDiscountRule(rule.id);
                      if (!result.ok) {
                        toast.error(result.message ?? "Unable to remove category discount.");
                        return;
                      }
                      toast.success("Category discount removed.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search products by name, slug, or SKU..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const rule = productRuleById.get(product.id);
            return (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">{product.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {product.sku} • {rule ? `${rule.percent}%` : "No product rule"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={productDrafts[product.id] ?? ""}
                    onChange={(event) =>
                      setProductDrafts((current) => ({
                        ...current,
                        [product.id]: event.target.value,
                      }))
                    }
                    type="number"
                    min={0}
                    max={100}
                    placeholder={rule ? String(rule.percent) : "10"}
                    className="h-8 w-24 rounded-xl"
                  />
                  <Button
                    size="sm"
                    className="h-8 rounded-xl"
                    onClick={() =>
                      applyRule({
                        scope: "product",
                        targetProductId: product.id,
                        percentInput:
                          productDrafts[product.id] || String(rule?.percent ?? ""),
                      })
                    }
                  >
                    Apply to Product
                  </Button>
                  {rule ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-xl"
                      onClick={() => {
                        const result = removeDiscountRule(rule.id);
                        if (!result.ok) {
                          toast.error(result.message ?? "Unable to remove product discount.");
                          return;
                        }
                        toast.success("Product discount removed.");
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">Discount Audit Log</p>
        <div className="space-y-1">
          {discountAuditLogs.slice(0, 10).map((auditLog) => (
            <div
              key={auditLog.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3 text-xs text-[var(--foreground-muted)]"
            >
              <p className="font-medium text-[var(--foreground)]">{auditLog.summary}</p>
              <p>
                {auditLog.scope} • {auditLog.action} • {auditLog.affectedProductIds.length} product(s)
              </p>
              <p>{formatShortDate(auditLog.createdAt)}</p>
            </div>
          ))}
          {!discountAuditLogs.length ? (
            <p className="text-xs text-[var(--foreground-subtle)]">
              No discount changes recorded yet.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
