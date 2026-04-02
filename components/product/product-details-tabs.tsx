"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product, Review } from "@/lib/types/ecommerce";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatShortDate } from "@/lib/utils/format";

interface ProductDetailsTabsProps {
  product: Product;
  reviews: Review[];
}

export function ProductDetailsTabs({ product, reviews }: ProductDetailsTabsProps) {
  return (
    <Tabs defaultValue="description">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        <TabsTrigger value="benefits">Benefits</TabsTrigger>
        <TabsTrigger value="usage">How to use</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">{product.description}</p>
      </TabsContent>
      <TabsContent value="ingredients" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <ul className="grid gap-2 text-sm text-[var(--foreground-muted)] sm:grid-cols-2">
          {product.ingredients.map((ingredient) => (
            <li key={ingredient} className="rounded-xl bg-[var(--surface-alt)] px-3 py-2">
              {ingredient}
            </li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="benefits" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="rounded-xl bg-[var(--surface-alt)] px-3 py-2">
              {benefit}
            </li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="usage" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <ol className="space-y-2 text-sm text-[var(--foreground-muted)]">
          {product.howToUse.map((step, index) => (
            <li key={step} className="rounded-xl bg-[var(--surface-alt)] px-3 py-2">
              <span className="font-semibold text-[var(--foreground)]">{index + 1}. </span>
              {step}
            </li>
          ))}
        </ol>
      </TabsContent>
      <TabsContent value="reviews" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="space-y-4">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{review.userName}</p>
                  <p className="text-xs text-[var(--foreground-subtle)]">{formatShortDate(review.createdAt)}</p>
                </div>
                <RatingStars rating={review.rating} className="mt-2" />
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{review.title}</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{review.comment}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-[var(--foreground-muted)]">No reviews yet for this product.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
