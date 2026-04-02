import { homepageBanners } from "@/lib/data/mock-data";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminBannersPage() {
  return (
    <AdminTableShell
      title="Banners"
      description="Manage homepage hero and promotional campaign assets."
      columns={["Title", "Badge", "CTA", "Link", "Status"]}
      rows={homepageBanners.map((banner) => [
        banner.title,
        banner.badge ?? "-",
        banner.ctaLabel ?? "-",
        banner.href ?? "-",
        banner.active ? "Active" : "Inactive",
      ])}
      primaryActionLabel="Upload Banner"
    />
  );
}
