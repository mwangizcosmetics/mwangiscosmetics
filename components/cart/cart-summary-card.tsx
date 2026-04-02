"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";

interface CartSummaryCardProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function CartSummaryCard({ subtotal, shipping, tax, total }: CartSummaryCardProps) {
  const [promoCode, setPromoCode] = useState("");

  return (
    <aside className="sticky top-24 space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Order Summary</h2>
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Promo code</label>
        <div className="flex gap-2">
          <Input
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder="GLOW10"
            className="h-10 rounded-xl"
          />
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => {
              if (!promoCode.trim()) {
                toast.error("Enter a promo code");
                return;
              }
              toast.success("Promo code captured. Validation runs at checkout.");
            }}
          >
            <Tag className="size-4" />
            Apply
          </Button>
        </div>
      </div>
      <Separator />
      <div className="space-y-2 text-sm text-[var(--foreground-muted)]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-[var(--foreground)]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="text-[var(--foreground)]">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated tax</span>
          <span className="text-[var(--foreground)]">{formatCurrency(tax)}</span>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button asChild className="h-11 w-full rounded-full">
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>
      <Button asChild variant="ghost" className="w-full rounded-full">
        <Link href="/shop">Continue Shopping</Link>
      </Button>
    </aside>
  );
}
