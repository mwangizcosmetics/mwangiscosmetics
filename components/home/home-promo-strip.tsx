import Link from "next/link";
import { Clock4 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteContainer } from "@/components/shared/site-container";

export function HomePromoStrip() {
  return (
    <section className="py-8">
      <SiteContainer>
        <div className="rounded-3xl border border-[var(--brand-300)] bg-[var(--brand-100)] px-5 py-6 shadow-[var(--shadow-soft)] sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[var(--brand-900)]">
                <Clock4 className="size-3.5" />
                Flash Offer
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] sm:text-2xl">Weekend Beauty Box: Save 20%</h3>
              <p className="max-w-2xl text-sm text-[var(--foreground-muted)]">
                Bundle your cleanser, serum, and moisturizer for the perfect starter ritual.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/shop?tag=offer">Claim Offer</Link>
            </Button>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
