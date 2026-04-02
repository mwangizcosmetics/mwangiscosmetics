import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";

export function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AnnouncementBar />
      <StoreHeader />
      <main className="mx-auto w-full pb-24 sm:pb-0">{children}</main>
      <StoreFooter />
      <MobileBottomNav />
    </div>
  );
}
