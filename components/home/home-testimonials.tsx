import { Quote } from "lucide-react";

import { testimonials } from "@/lib/data/mock-data";
import { RatingStars } from "@/components/shared/rating-stars";
import { SiteContainer } from "@/components/shared/site-container";
import { SectionHeading } from "@/components/shared/section-heading";

export function HomeTestimonials() {
  return (
    <section className="py-8 sm:py-12">
      <SiteContainer className="space-y-5">
        <SectionHeading
          eyebrow="Community Love"
          title="What Customers Say"
          description="Authentic feedback from beauty lovers shopping with MWANGIZ Cosmetics."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
              <Quote className="mb-3 size-5 text-[var(--brand-500)]" />
              <p className="text-sm leading-relaxed text-[var(--foreground)]">{testimonial.text}</p>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">{testimonial.customerName}</p>
                {testimonial.skinType ? <p className="text-xs text-[var(--foreground-subtle)]">{testimonial.skinType} skin</p> : null}
                <RatingStars rating={testimonial.rating} />
              </div>
            </article>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
