"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";

import type { Product } from "@/lib/types/ecommerce";
import { PriceDisplay } from "@/components/shared/price-display";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { getProductPricingSnapshot } from "@/lib/services/pricing-service";
import { cn } from "@/lib/utils/cn";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  className?: string;
}

export function ProductCard({ product, compact = false, className }: ProductCardProps) {
  const discountRules = useCommerceStore((state) => state.discountRules);
  const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const pricing = useMemo(
    () => getProductPricingSnapshot(product, discountRules),
    [discountRules, product],
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] focus-visible:ring-offset-2",
        className,
      )}
    >
      <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: "easeOut" }} className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-[var(--brand-50)]">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className={cn("flex min-h-[72px] flex-1 flex-col gap-2 p-2.5", compact ? "min-h-[66px]" : "")}>
          <p className={cn("line-clamp-2 text-[11px] font-semibold text-[var(--foreground)] sm:text-xs", compact ? "line-clamp-1" : "")}>
            {product.name}
          </p>
          <div className="mt-auto">
            <PriceDisplay
              price={pricing.finalPrice}
              compareAtPrice={pricing.compareAtPrice}
              currency={product.currency}
            />
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
