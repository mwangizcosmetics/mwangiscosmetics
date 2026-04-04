"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import type { Product } from "@/lib/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/shared/discount-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { cn } from "@/lib/utils/cn";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  className?: string;
}

export function ProductCard({ product, compact = false, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const hasInWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.productId === product.id),
  );

  const image = product.images.find((img) => img.isPrimary) ?? product.images[0];

  const handleAddToCart = () => {
    addItem(product.id, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    toast.success(hasInWishlist ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] transition",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-square overflow-hidden bg-[var(--brand-50)]"
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
          {product.isNew ? <Badge variant="soft">New</Badge> : null}
          {product.isBestSeller ? <Badge variant="default">Best Seller</Badge> : null}
        </div>
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-1.5 top-1.5 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-[var(--foreground-muted)] shadow-sm transition hover:bg-white hover:text-[var(--foreground)]"
        >
          <Heart className={cn("size-4", hasInWishlist ? "fill-[var(--brand-900)] text-[var(--brand-900)]" : "")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <div className="space-y-0.5">
          {!compact ? (
            <p className="text-[9px] font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">{product.brand}</p>
          ) : null}
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-1 text-[11px] font-semibold text-[var(--foreground)] transition hover:text-[var(--brand-800)] sm:text-xs"
          >
            {product.name}
          </Link>
          {!compact ? (
            <p className="line-clamp-1 text-[10px] text-[var(--foreground-muted)]">{product.shortDescription}</p>
          ) : null}
        </div>
        {!compact ? <RatingStars rating={product.rating} reviewCount={product.ratingCount} /> : null}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="space-y-0.5">
              <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} currency={product.currency} />
              <DiscountBadge price={product.price} compareAtPrice={product.compareAtPrice} />
            </div>
          </div>
          {!compact ? (
            <Button size="sm" className="h-7 w-full rounded-lg px-2 text-[10px]" onClick={handleAddToCart}>
              <ShoppingBag className="size-3.5" />
              Add to Cart
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
