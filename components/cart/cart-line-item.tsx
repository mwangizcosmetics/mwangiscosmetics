"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { formatCurrency } from "@/lib/utils/format";
import { useCartStore } from "@/lib/stores/cart-store";
import type { Product } from "@/lib/types/ecommerce";

interface CartLineItemProps {
  product: Product;
  quantity: number;
}

export function CartLineItem({ product, quantity }: CartLineItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <article className="grid grid-cols-[84px_1fr] gap-3 rounded-2xl border border-[var(--border)] bg-white p-3">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-xl bg-[var(--brand-50)]">
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          sizes="84px"
          className="object-cover"
        />
      </Link>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">{product.brand}</p>
          <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">
            {product.name}
          </Link>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{formatCurrency(product.price, product.currency)}</p>
        </div>
        <div className="flex items-center justify-between">
          <QuantitySelector value={quantity} onChange={(nextQty) => updateQuantity(product.id, nextQty)} max={product.stock} />
          <Button variant="ghost" size="sm" className="rounded-xl text-[var(--foreground-muted)]" onClick={() => removeItem(product.id)}>
            <Trash2 className="size-4" />
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}
