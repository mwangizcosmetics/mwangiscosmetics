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
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { DiscountBadge } from "@/components/shared/discount-badge";
import { formatRelativeStock } from "@/lib/utils/format";
import { getProductPricingSnapshot } from "@/lib/services/pricing-service";
import { useServiceLocationStore } from "@/lib/stores/service-location-store";
import {
  getActiveCounties,
  getActiveTownsForCounty,
} from "@/lib/services/service-location-service";
import { getDeliveryQuote } from "@/lib/services/commerce-selectors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(product.stock > 0 ? 1 : 0);
  const [selectedCountyId, setSelectedCountyId] = useState("");
  const [selectedTownId, setSelectedTownId] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const discountRules = useCommerceStore((state) => state.discountRules);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const hasInWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.productId === product.id),
  );
  const counties = useServiceLocationStore((state) => state.counties);
  const towns = useServiceLocationStore((state) => state.towns);

  const stockLabel = useMemo(() => formatRelativeStock(product.stock), [product.stock]);
  const pricing = useMemo(
    () => getProductPricingSnapshot(product, discountRules),
    [discountRules, product],
  );
  const activeCounties = useMemo(() => getActiveCounties(counties, towns), [counties, towns]);
  const effectiveCountyId = selectedCountyId || activeCounties[0]?.id || "";
  const activeTowns = useMemo(
    () => getActiveTownsForCounty(towns, effectiveCountyId),
    [effectiveCountyId, towns],
  );
  const effectiveTownId =
    selectedTownId && activeTowns.some((town) => town.id === selectedTownId)
      ? selectedTownId
      : activeTowns[0]?.id || "";
  const deliveryQuote = useMemo(
    () => getDeliveryQuote(counties, towns, effectiveCountyId, effectiveTownId),
    [counties, effectiveCountyId, effectiveTownId, towns],
  );

  const handleAddToCart = () => {
    if (product.stock < 1) {
      toast.error("This product is currently out of stock.");
      return;
    }
    addItem(product.id, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (product.stock < 1) {
      toast.error("This product is currently out of stock.");
      return;
    }
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
        <PriceDisplay
          price={pricing.finalPrice}
          compareAtPrice={pricing.compareAtPrice}
          currency={product.currency}
          className="text-2xl"
        />
        {pricing.hasDiscount ? <Badge variant="soft">Limited offer</Badge> : null}
        <DiscountBadge
          price={pricing.finalPrice}
          compareAtPrice={pricing.compareAtPrice}
          discountPercent={pricing.discountPercent}
        />
      </div>
      <div className="inline-flex rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-medium text-[var(--brand-900)]">
        {stockLabel}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--foreground)]">Quantity</p>
          <QuantitySelector
            value={quantity || 1}
            onChange={setQuantity}
            max={Math.max(product.stock, 1)}
          />
        </div>
        <div className="grid gap-2">
          <Button className="h-11 rounded-full" onClick={handleAddToCart} disabled={product.stock < 1}>
            <ShoppingBag className="size-4" />
            {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={handleBuyNow} disabled={product.stock < 1}>
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
        <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            Delivery Estimate
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              value={effectiveCountyId || undefined}
              onValueChange={(value) => {
                setSelectedCountyId(value);
                setSelectedTownId("");
              }}
            >
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="County" />
              </SelectTrigger>
              <SelectContent>
                {activeCounties.map((county) => (
                  <SelectItem key={county.id} value={county.id}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={effectiveTownId || undefined} onValueChange={setSelectedTownId}>
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Town/Center" />
              </SelectTrigger>
              <SelectContent>
                {activeTowns.map((town) => (
                  <SelectItem key={town.id} value={town.id}>
                    {town.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            {deliveryQuote.isServiceable
              ? `Deliver to ${deliveryQuote.townName} in ${deliveryQuote.etaText} - KSh ${deliveryQuote.fee}`
              : "Select a serviceable county and town for delivery fee and ETA."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-[var(--brand-700)]" />
          Delivery fee is calculated by selected town
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[var(--brand-700)]" />
          100% authentic beauty products
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 p-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-2">
          <Button className="h-11 flex-1 rounded-full" onClick={handleAddToCart} disabled={product.stock < 1}>
            {product.stock < 1 ? "Out of Stock" : `Add ${Math.max(quantity, 1)} to Cart`}
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={handleBuyNow} disabled={product.stock < 1}>
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}
