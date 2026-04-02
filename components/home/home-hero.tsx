"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/search-input";
import { homepageBanners } from "@/lib/data/mock-data";
import { SiteContainer } from "@/components/shared/site-container";

export function HomeHero() {
  const primaryBanner = homepageBanners[0];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(166,127,110,0.16),transparent_70%),radial-gradient(45%_35%_at_0%_30%,rgba(233,214,202,0.6),transparent_70%)]" />
      <SiteContainer className="relative py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]"
        >
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-medium text-[var(--brand-900)]">
                <Sparkles className="size-3.5" />
                {primaryBanner.badge}
              </div>
              <div className="space-y-3">
                <h1 className="max-w-[18ch] text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl">
                  {primaryBanner.title}
                </h1>
                <p className="max-w-xl text-sm text-[var(--foreground-muted)] sm:text-base">{primaryBanner.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="lg" className="rounded-full">
                  <Link href={primaryBanner.href ?? "/shop"}>
                    {primaryBanner.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/shop">Build Your Routine</Link>
                </Button>
              </div>
              <SearchInput className="max-w-xl" />
            </div>
            <div className="relative min-h-64 overflow-hidden rounded-[1.6rem] bg-[var(--brand-100)] sm:min-h-80">
              <motion.img
                src={primaryBanner.imageUrl}
                alt={primaryBanner.title}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">This Week</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">Flash savings up to 25%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </SiteContainer>
    </section>
  );
}
