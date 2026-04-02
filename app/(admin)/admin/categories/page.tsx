import { categories } from "@/lib/data/mock-data";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminCategoriesPage() {
  return (
    <AdminTableShell
      title="Categories"
      description="Organize storefront navigation and product grouping."
      columns={["Category", "Slug", "Products", "Featured"]}
      rows={categories.map((category) => [
        category.name,
        category.slug,
        String(category.productCount),
        category.featured ? "Yes" : "No",
      ])}
      primaryActionLabel="Add Category"
    />
  );
}
