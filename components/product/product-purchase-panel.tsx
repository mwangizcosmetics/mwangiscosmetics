"use client";

import { Heart, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/lib/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { formatRelativeStock } from "@/lib/utils/format";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const hasInWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.productId === product.id),
  );

  const stockLabel = useMemo(() => formatRelativeStock(product.stock), [product.stock]);

  const handleAddToCart = () => {
    addItem(product.id, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product.id, quantity);
    toast.success("Added to cart. Continue to checkout.");
  };

  return (
    <div className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">{product.brand}</p>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--foreground)] sm:text-3xl">{product.name}</h1>
        <p className="text-sm text-[var(--foreground-muted)]">{product.shortDescription}</p>
        <RatingStars rating={product.rating} reviewCount={product.ratingCount} />
      </div>
      <div className="flex items-center gap-3">
        <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} currency={product.currency} className="text-2xl" />
        {product.compareAtPrice ? <Badge variant="soft">Limited offer</Badge> : null}
      </div>
      <div className="inline-flex rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-medium text-[var(--brand-900)]">
        {stockLabel}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--foreground)]">Quantity</p>
          <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
        </div>
        <div className="grid gap-2">
          <Button className="h-11 rounded-full" onClick={handleAddToCart}>
            <ShoppingBag className="size-4" />
            Add to Cart
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={handleBuyNow}>
            <Zap className="size-4" />
            Buy Now
          </Button>
          <Button
            variant="ghost"
            className="h-11 rounded-full"
            onClick={() => {
              toggleWishlist(product.id);
              toast.success(hasInWishlist ? "Removed from wishlist" : "Saved to wishlist");
            }}
          >
            <Heart className={`size-4 ${hasInWishlist ? "fill-[var(--brand-900)] text-[var(--brand-900)]" : ""}`} />
            {hasInWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
          </Button>
        </div>
      </div>
      <div className="space-y-2 rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--foreground-muted)]">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-[var(--brand-700)]" />
          Free delivery for orders above KES 7,500
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[var(--brand-700)]" />
          100% authentic beauty products
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 p-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-2">
          <Button className="h-11 flex-1 rounded-full" onClick={handleAddToCart}>
            Add {quantity} to Cart
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={handleBuyNow}>
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}
