import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  Address,
  Order,
  OrderEvent,
  RefundRequest,
} from "@/lib/types/ecommerce";

type ServiceSupabaseClient = SupabaseClient<Database>;
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type OrderEventRow = Database["public"]["Tables"]["order_events"]["Row"];
type RefundRow = Database["public"]["Tables"]["refunds"]["Row"];

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function mapShippingAddress(shipping: Json): Address {
  const data = asRecord(shipping);
  return {
    id: String(data.id ?? `addr-${String(data.townCenterId ?? "snapshot")}`),
    userId: String(data.userId ?? ""),
    label: typeof data.label === "string" ? data.label : undefined,
    fullName: String(data.fullName ?? ""),
    email: typeof data.email === "string" ? data.email : undefined,
    phone: String(data.phone ?? ""),
    countyId: String(data.countyId ?? ""),
    county: String(data.countyName ?? data.county ?? ""),
    townCenterId: String(data.townCenterId ?? ""),
    townCenter: String(data.townCenterName ?? data.townCenter ?? ""),
    streetAddress: String(data.streetAddress ?? ""),
    buildingOrHouse:
      typeof data.buildingOrHouse === "string" ? data.buildingOrHouse : undefined,
    landmark: typeof data.landmark === "string" ? data.landmark : undefined,
    isPrimary: Boolean(data.isPrimary),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

function mapOrderRow(order: OrderRow, items: OrderItemRow[]): Order {
  const shippingAddress = mapShippingAddress(order.shipping_address);
  const deliverySnapshotRecord = asRecord(order.delivery_snapshot);
  const deliverySnapshot =
    order.delivery_snapshot && Object.keys(deliverySnapshotRecord).length
      ? (() => {
          const etaUnitRaw = deliverySnapshotRecord.etaUnit;
          const etaUnit: "hours" | "days" | null =
            etaUnitRaw === "hours" || etaUnitRaw === "days" ? etaUnitRaw : null;
          return {
            county: String(deliverySnapshotRecord.county ?? shippingAddress.county),
            townCenter: String(
              deliverySnapshotRecord.townCenter ?? shippingAddress.townCenter,
            ),
            deliveryFee: Number(deliverySnapshotRecord.deliveryFee ?? order.shipping ?? 0),
            etaMinValue:
              deliverySnapshotRecord.etaMinValue == null
                ? null
                : Number(deliverySnapshotRecord.etaMinValue),
            etaMaxValue:
              deliverySnapshotRecord.etaMaxValue == null
                ? null
                : Number(deliverySnapshotRecord.etaMaxValue),
            etaUnit,
            etaText: String(
              deliverySnapshotRecord.etaText ??
                `${deliverySnapshotRecord.etaMinValue ?? ""}-${deliverySnapshotRecord.etaMaxValue ?? ""} ${deliverySnapshotRecord.etaUnit ?? "days"}`,
            ).trim(),
          };
        })()
      : undefined;

  return {
    id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    status: order.status,
    items: items.map((item) => {
      const snapshot = asRecord(item.product_snapshot);
      const imageFromSnapshot = asRecord(
        (snapshot.productImage as Json | null | undefined) ?? null,
      );
      return {
        productId: item.product_id ?? String(snapshot.productId ?? "unknown"),
        quantity: item.quantity,
        unitPrice: item.unit_price,
        productSnapshot: {
          name: String(
            snapshot.productName ?? snapshot.name ?? `Product ${item.product_id ?? "N/A"}`,
          ),
          image: String(
            snapshot.productImageUrl ??
              snapshot.image ??
              imageFromSnapshot.url ??
              "/placeholders/product-1.jpg",
          ),
        },
      };
    }),
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    placedAt: order.placed_at,
    shippingAddress,
    deliverySnapshot,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    paymentReference: order.payment_reference ?? undefined,
    inventoryCommittedAt: order.inventory_committed_at ?? undefined,
    deliveryAgentId: order.delivery_agent_id ?? undefined,
    readyForDispatchAt: order.ready_for_dispatch_at ?? undefined,
    inTransitAt: order.in_transit_at ?? undefined,
    deliveredAt: order.delivered_at ?? undefined,
    deliveryFailedAt: order.delivery_failed_at ?? undefined,
    returnedAt: order.returned_at ?? undefined,
    dispatchNote: order.dispatch_note ?? undefined,
    deliveryNote: order.delivery_note ?? undefined,
  };
}

function mapRefund(refund: RefundRow): RefundRequest {
  return {
    id: refund.id,
    orderId: refund.order_id,
    userId: refund.user_id,
    reason: refund.reason,
    note: refund.note ?? undefined,
    status: refund.status,
    adminNote: refund.admin_note ?? undefined,
    createdAt: refund.created_at,
    updatedAt: refund.updated_at,
  };
}

function mapOrderEvent(event: OrderEventRow): OrderEvent {
  return {
    id: event.id,
    orderId: event.order_id,
    eventType: event.event_type,
    message: event.message,
    createdAt: event.created_at,
  };
}

export async function getUserOrdersBundle(
  supabase: ServiceSupabaseClient,
  userId: string,
) {
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id,order_number,user_id,status,subtotal,discount,shipping,tax,total,currency,shipping_address,payment_method,payment_status,payment_reference,inventory_committed_at,delivery_agent_id,ready_for_dispatch_at,in_transit_at,delivered_at,delivery_failed_at,returned_at,dispatch_note,delivery_note,placed_at,estimated_delivery,delivery_snapshot,created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return {
      ok: false as const,
      message: "Unable to load orders.",
      orders: [] as Order[],
      orderEvents: [] as OrderEvent[],
      refunds: [] as RefundRequest[],
    };
  }

  const orders = (ordersData ?? []) as OrderRow[];
  if (!orders.length) {
    return {
      ok: true as const,
      orders: [] as Order[],
      orderEvents: [] as OrderEvent[],
      refunds: [] as RefundRequest[],
    };
  }

  const orderIds = orders.map((order) => order.id);
  const [{ data: orderItems }, { data: orderEvents }, { data: refunds }] = await Promise.all([
    supabase
      .from("order_items")
      .select("id,order_id,product_id,quantity,unit_price,product_snapshot,created_at")
      .in("order_id", orderIds),
    supabase
      .from("order_events")
      .select("id,order_id,event_type,message,created_at")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("refunds")
      .select("id,order_id,user_id,reason,note,status,admin_note,created_at,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const orderItemsByOrderId = new Map<string, OrderItemRow[]>();
  for (const orderItem of (orderItems ?? []) as OrderItemRow[]) {
    const group = orderItemsByOrderId.get(orderItem.order_id) ?? [];
    group.push(orderItem);
    orderItemsByOrderId.set(orderItem.order_id, group);
  }

  return {
    ok: true as const,
    orders: orders.map((order) =>
      mapOrderRow(order, orderItemsByOrderId.get(order.id) ?? []),
    ),
    orderEvents: ((orderEvents ?? []) as OrderEventRow[]).map(mapOrderEvent),
    refunds: ((refunds ?? []) as RefundRow[]).map(mapRefund),
  };
}
