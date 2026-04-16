import type { OrderStatus } from "@/lib/types/ecommerce";
import { orderStatusDisplay } from "@/lib/constants/shop";
import { cn } from "@/lib/utils/cn";

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-[#fff2e2] text-[#94511a]",
  pending_payment: "bg-[#fff0d9] text-[#9a5b13]",
  payment_init_failed: "bg-[#ffe6dc] text-[#9a4120]",
  failed_payment: "bg-[#ffe4e4] text-[#9e2a2a]",
  refund_requested: "bg-[#f7efff] text-[#6540a1]",
  confirmed: "bg-[#eaf3ff] text-[#24508d]",
  paid: "bg-[#e9f4ff] text-[#1d5f9f]",
  ready_for_dispatch: "bg-[#fceff6] text-[#b91865]",
  preparing: "bg-[#efe9ff] text-[#5a42a8]",
  left_shop: "bg-[#e8f4ff] text-[#255f9f]",
  in_transit: "bg-[#e5f4ff] text-[#1e5e8f]",
  out_for_delivery: "bg-[#e8fff6] text-[#1c6a4f]",
  delivery_failed: "bg-[#ffe7ea] text-[#a11f2f]",
  returned: "bg-[#f5f1f2] text-[#6e4f59]",
  processing: "bg-[#efe9ff] text-[#5a42a8]",
  shipped: "bg-[#e8f4ff] text-[#255f9f]",
  delivered: "bg-[#e6f6ee] text-[#18683d]",
  cancelled: "bg-[#fdecec] text-[#9e2a2a]",
  refunded: "bg-[#f0f0f0] text-[#555555]",
};

interface OrderStatusPillProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusPill({ status, className }: OrderStatusPillProps) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusStyle[status], className)}>
      {orderStatusDisplay[status]}
    </span>
  );
}
