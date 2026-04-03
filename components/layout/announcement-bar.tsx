import { Truck } from "lucide-react";

import { SiteContainer } from "@/components/shared/site-container";

export function AnnouncementBar() {
  return (
    <div className="bg-[var(--brand-900)] py-1 text-[10px] text-white">
      <SiteContainer className="flex items-center justify-center gap-1.5 text-center font-medium sm:text-[11px]">
        <Truck className="size-3" />
        Free Eldoret delivery on orders above KES 2,000. Same-day dispatch before 2pm.
      </SiteContainer>
    </div>
  );
}
