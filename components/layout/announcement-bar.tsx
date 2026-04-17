import { SiteContainer } from "@/components/shared/site-container";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function AnnouncementBar() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_announcements")
    .select("message,is_active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.is_active || !data.message.trim()) {
    return null;
  }

  return (
    <div className="bg-[var(--brand-900)] py-1.5 text-[10px] text-white">
      <SiteContainer className="text-center font-medium sm:text-[11px]">
        {data.message}
      </SiteContainer>
    </div>
  );
}
