import { adminTableSamples } from "@/lib/data/mock-data";
import { formatCurrency } from "@/lib/utils/format";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminProductsPage() {
  return (
    <AdminTableShell
      title="Product Catalog"
      description="Manage inventory, pricing, and product visibility."
      columns={["Name", "SKU", "Category", "Stock", "Price", "Status"]}
      rows={adminTableSamples.products.map((product) => [
        product.name,
        product.sku,
        product.category,
        String(product.stock),
        formatCurrency(product.price),
        product.status,
      ])}
      primaryActionLabel="Add Product"
    />
  );
}
