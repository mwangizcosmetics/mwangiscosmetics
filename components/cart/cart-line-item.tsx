"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { DiscountBadge } from "@/components/shared/discount-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import type { Product } from "@/lib/types/ecommerce";
import { formatCurrency } from "@/lib/utils/format";

interface CartLineItemProps {
  product: Product;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number;
  discountPercent?: number;
  lineTotal: number;
}

export function CartLineItem({
  product,
  quantity,
  unitPrice,
  compareAtPrice,
  discountPercent,
  lineTotal,
}: CartLineItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <article className="grid grid-cols-[84px_1fr] gap-3 rounded-2xl border border-[var(--border)] bg-white p-3">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-[var(--brand-50)]"
      >
        <Image src={product.images[0].url} alt={product.name} fill sizes="84px" className="object-cover" />
      </Link>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            {product.brand}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]"
          >
            {product.name}
          </Link>
          <div className="mt-1 space-y-1">
            <PriceDisplay
              price={unitPrice}
              compareAtPrice={compareAtPrice}
              currency={product.currency}
            />
            <DiscountBadge
              price={unitPrice}
              compareAtPrice={compareAtPrice}
              discountPercent={discountPercent}
            />
          </div>
          {product.stock < 1 ? (
            <p className="mt-1 text-xs font-medium text-[#a11f2f]">Out of stock</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            {product.stock > 0 ? (
              <QuantitySelector
                value={quantity}
                onChange={(nextQty) => updateQuantity(product.id, nextQty)}
                max={product.stock}
              />
            ) : (
              <p className="text-xs font-medium text-[var(--foreground-subtle)]">
                Remove unavailable item
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-[var(--foreground-muted)]"
              onClick={() => removeItem(product.id)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
          <p className="text-right text-xs font-semibold text-[var(--foreground)]">
            Line total: {formatCurrency(lineTotal, product.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}
