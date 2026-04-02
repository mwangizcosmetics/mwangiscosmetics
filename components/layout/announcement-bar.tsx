import { Truck } from "lucide-react";

import { SiteContainer } from "@/components/shared/site-container";

export function AnnouncementBar() {
  return (
    <div className="bg-[var(--brand-900)] py-2 text-[11px] text-white">
      <SiteContainer className="flex items-center justify-center gap-2 text-center font-medium sm:text-xs">
        <Truck className="size-3.5" />
        Free Nairobi delivery above KES 7,500. Same-day dispatch on confirmed orders before 3pm.
      </SiteContainer>
    </div>
  );
}
