"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteContainer } from "@/components/shared/site-container";

export function HomeNewsletter() {
  const [email, setEmail] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email to subscribe");
      return;
    }
    toast.success("You are subscribed to beauty updates");
    setEmail("");
  };

  return (
    <section className="py-10 sm:py-14">
      <SiteContainer>
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Beauty updates</p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Get product drops, offers, and routine tips</h3>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Join our newsletter for curated skincare and makeup picks tailored to your beauty goals.
              </p>
            </div>
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:flex-row lg:w-[380px]">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-full"
              />
              <Button type="submit" className="rounded-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
