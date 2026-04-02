import { reviews } from "@/lib/data/mock-data";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { formatShortDate } from "@/lib/utils/format";

export default function AdminReviewsPage() {
  return (
    <AdminTableShell
      title="Reviews"
      description="Moderate customer feedback and highlight trusted testimonials."
      columns={["Customer", "Rating", "Title", "Verified", "Date"]}
      rows={reviews.map((review) => [
        review.userName,
        `${review.rating}/5`,
        review.title,
        review.verifiedPurchase ? "Yes" : "No",
        formatShortDate(review.createdAt),
      ])}
      primaryActionLabel="Moderation Queue"
    />
  );
}
