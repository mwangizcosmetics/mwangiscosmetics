import { coupons } from "@/lib/data/mock-data";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default function AdminCouponsPage() {
  return (
    <AdminTableShell
      title="Coupons"
      description="Launch promotional campaigns and control discount rules."
      columns={["Code", "Type", "Value", "Minimum Order", "Status"]}
      rows={coupons.map((coupon) => [
        coupon.code,
        coupon.type,
        coupon.type === "fixed" ? `KES ${coupon.value}` : `${coupon.value}%`,
        coupon.minSubtotal ? `KES ${coupon.minSubtotal}` : "-",
        coupon.active ? "Active" : "Inactive",
      ])}
      primaryActionLabel="Create Coupon"
    />
  );
}
