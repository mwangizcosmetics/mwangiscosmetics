import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";
import type { NormalizedRole } from "@/lib/services/rbac";
import {
  canMarkReadyForDispatch,
  minutesSince,
  type DbOrderStatus,
} from "@/lib/services/orders/delivery-workflow";

type ServiceSupabaseClient = SupabaseClient<Database>;
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderEventRow = Database["public"]["Tables"]["order_events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface DeliveryOpsOrder {
  id: string;
  orderNumber: string;
  status: DbOrderStatus;
  paymentStatus: "pending" | "success" | "failed" | "refunded";
  total: number;
  currency: Database["public"]["Enums"]["currency_code"];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine: string;
  county: string;
  townCenter: string;
  createdAt: string;
  readyForDispatchAt?: string;
  inTransitAt?: string;
  deliveredAt?: string;
  deliveryFailedAt?: string;
  returnedAt?: string;
  dispatchAgeMinutes?: number | null;
  transitAgeMinutes?: number | null;
  dispatchNote?: string;
  deliveryNote?: string;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  recentEvents: Array<{
    id: string;
    eventType: string;
    message: string;
    createdAt: string;
  }>;
}

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapAddress(shippingAddress: Json) {
  const shipping = asRecord(shippingAddress);
  const customerName = asString(shipping.fullName) || "Unknown customer";
  const customerPhone = asString(shipping.phone) || "No phone";
  const customerEmail = asString(shipping.email) || undefined;
  const streetAddress = asString(shipping.streetAddress);
  const building = asString(shipping.buildingOrHouse);
  const county = asString(shipping.countyName || shipping.county);
  const townCenter = asString(shipping.townCenterName || shipping.townCenter);
  const landmark = asString(shipping.landmark);
  const addressLine = [streetAddress, building, landmark].filter(Boolean).join(", ");

  return {
    customerName,
    customerPhone,
    customerEmail,
    county,
    townCenter,
    addressLine: addressLine || streetAddress || "Address unavailable",
  };
}

function uniqueOrderIds(orders: OrderRow[]) {
  return [...new Set(orders.map((order) => order.id))];
}

function mapEventsByOrderId(events: OrderEventRow[]) {
  const eventsByOrderId = new Map<string, OrderEventRow[]>();
  for (const event of events) {
    const group = eventsByOrderId.get(event.order_id) ?? [];
    group.push(event);
    eventsByOrderId.set(event.order_id, group);
  }

  return eventsByOrderId;
}

function isDispatchVisibleStatus(status: DbOrderStatus) {
  return (
    status === "paid" ||
    status === "confirmed" ||
    status === "ready_for_dispatch" ||
    status === "in_transit" ||
    status === "delivered" ||
    status === "delivery_failed" ||
    status === "returned"
  );
}

export async function getDeliveryOperationsFeed(input: {
  supabase: ServiceSupabaseClient;
  actorRole: NormalizedRole;
  actorUserId: string;
}) {
  const query = input.supabase
    .from("orders")
    .select(
      "id,order_number,user_id,status,total,currency,payment_status,shipping_address,delivery_agent_id,ready_for_dispatch_at,in_transit_at,delivered_at,delivery_failed_at,returned_at,dispatch_note,delivery_note,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const { data: ordersData, error } = await query;
  if (error) {
    return {
      ok: false as const,
      message: "Unable to load delivery operations feed.",
      orders: [] as DeliveryOpsOrder[],
    };
  }

  let orders = ((ordersData ?? []) as OrderRow[]).filter((order) =>
    isDispatchVisibleStatus(order.status),
  );
  if (input.actorRole === "beba") {
    orders = orders.filter(
      (order) =>
        order.status === "ready_for_dispatch" ||
        (order.delivery_agent_id === input.actorUserId &&
          (order.status === "in_transit" ||
            order.status === "delivery_failed" ||
            order.status === "delivered")),
    );
  }

  if (!orders.length) {
    return {
      ok: true as const,
      orders: [] as DeliveryOpsOrder[],
    };
  }

  const orderIds = uniqueOrderIds(orders);
  const assignedAgentIds = [
    ...new Set(
      orders
        .map((order) => order.delivery_agent_id)
        .filter((agentId): agentId is string => Boolean(agentId)),
    ),
  ];

  const [{ data: eventsData }, { data: agentsData }] = await Promise.all([
    input.supabase
      .from("order_events")
      .select("id,order_id,event_type,message,created_at")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false }),
    assignedAgentIds.length
      ? input.supabase
          .from("profiles")
          .select("id,full_name")
          .in("id", assignedAgentIds)
      : Promise.resolve({ data: [] } as const),
  ]);

  const eventsByOrderId = mapEventsByOrderId((eventsData ?? []) as OrderEventRow[]);
  const agentNameById = new Map(
    ((agentsData ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile.full_name ?? "Assigned BEBA",
    ]),
  );

  const mappedOrders = orders.map((order) => {
    const mappedAddress = mapAddress(order.shipping_address);
    const eventList = (eventsByOrderId.get(order.id) ?? []).slice(0, 5);
    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      total: order.total,
      currency: order.currency,
      customerName: mappedAddress.customerName,
      customerPhone: mappedAddress.customerPhone,
      customerEmail: mappedAddress.customerEmail,
      addressLine: mappedAddress.addressLine,
      county: mappedAddress.county,
      townCenter: mappedAddress.townCenter,
      createdAt: order.created_at,
      readyForDispatchAt: order.ready_for_dispatch_at ?? undefined,
      inTransitAt: order.in_transit_at ?? undefined,
      deliveredAt: order.delivered_at ?? undefined,
      deliveryFailedAt: order.delivery_failed_at ?? undefined,
      returnedAt: order.returned_at ?? undefined,
      dispatchAgeMinutes: minutesSince(order.ready_for_dispatch_at),
      transitAgeMinutes: minutesSince(order.in_transit_at),
      dispatchNote: order.dispatch_note ?? undefined,
      deliveryNote: order.delivery_note ?? undefined,
      deliveryAgentId: order.delivery_agent_id ?? undefined,
      deliveryAgentName: order.delivery_agent_id
        ? agentNameById.get(order.delivery_agent_id) ?? "Assigned BEBA"
        : undefined,
      recentEvents: eventList.map((event) => ({
        id: event.id,
        eventType: event.event_type,
        message: event.message,
        createdAt: event.created_at,
      })),
    } satisfies DeliveryOpsOrder;
  });

  return {
    ok: true as const,
    orders: mappedOrders,
  };
}

export async function markReadyForDispatch(input: {
  supabase: ServiceSupabaseClient;
  orderId: string;
  actorUserId: string;
  dispatchNote?: string;
}) {
  const { data: existingOrder } = await input.supabase
    .from("orders")
    .select("id,order_number,status,payment_status,ready_for_dispatch_at")
    .eq("id", input.orderId)
    .maybeSingle();

  if (!existingOrder) {
    return { ok: false as const, status: 404, message: "Order not found." };
  }

  if (
    !canMarkReadyForDispatch({
      status: existingOrder.status,
      paymentStatus: existingOrder.payment_status,
    })
  ) {
    return {
      ok: false as const,
      status: 409,
      message: "Only paid/confirmed orders can be moved to ready for dispatch.",
    };
  }

  const nowIso = new Date().toISOString();
  const { data: updatedOrder } = await input.supabase
    .from("orders")
    .update({
      status: "ready_for_dispatch",
      ready_for_dispatch_at: nowIso,
      dispatch_note: input.dispatchNote ?? null,
      updated_at: nowIso,
    })
    .eq("id", input.orderId)
    .in("status", ["paid", "confirmed"])
    .eq("payment_status", "success")
    .select("id,status,ready_for_dispatch_at")
    .maybeSingle();

  if (!updatedOrder) {
    return {
      ok: false as const,
      status: 409,
      message: "Order was changed by another action. Refresh and retry.",
    };
  }

  await input.supabase.from("order_events").insert({
    order_id: input.orderId,
    event_type: "ready_for_dispatch",
    message: "Order marked ready for dispatch by staff.",
    created_at: nowIso,
  });

  return {
    ok: true as const,
    order: updatedOrder,
  };
}

export async function setDeliveryOutcome(input: {
  supabase: ServiceSupabaseClient;
  orderId: string;
  actorUserId: string;
  actorRole: NormalizedRole;
  targetStatus: "delivered" | "delivery_failed" | "returned";
  deliveryNote?: string;
}) {
  const { data: order } = await input.supabase
    .from("orders")
    .select("id,order_number,status,delivery_agent_id")
    .eq("id", input.orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false as const, status: 404, message: "Order not found." };
  }

  const isAssignedAgent = order.delivery_agent_id === input.actorUserId;
  if (input.actorRole === "beba" && !isAssignedAgent) {
    return {
      ok: false as const,
      status: 403,
      message: "You can only update deliveries assigned to your account.",
    };
  }

  if (input.targetStatus === "delivered" || input.targetStatus === "delivery_failed") {
    if (order.status !== "in_transit") {
      return {
        ok: false as const,
        status: 409,
        message: "Only in-transit orders can be completed or failed.",
      };
    }
  }

  if (input.targetStatus === "returned") {
    if (order.status !== "delivery_failed" && order.status !== "delivered") {
      return {
        ok: false as const,
        status: 409,
        message: "Order can be marked returned only after failure/delivery completion.",
      };
    }
  }

  const nowIso = new Date().toISOString();
  const updatePayload: Database["public"]["Tables"]["orders"]["Update"] = {
    status: input.targetStatus,
    delivery_note: input.deliveryNote ?? null,
    updated_at: nowIso,
  };
  if (input.targetStatus === "delivered") {
    updatePayload.delivered_at = nowIso;
  } else if (input.targetStatus === "delivery_failed") {
    updatePayload.delivery_failed_at = nowIso;
  } else if (input.targetStatus === "returned") {
    updatePayload.returned_at = nowIso;
  }

  const { data: updatedOrder } = await input.supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", input.orderId)
    .eq("status", order.status)
    .select("id,status")
    .maybeSingle();

  if (!updatedOrder) {
    return {
      ok: false as const,
      status: 409,
      message: "Unable to update delivery status. Refresh and retry.",
    };
  }

  await input.supabase.from("order_events").insert({
    order_id: input.orderId,
    event_type: input.targetStatus,
    message:
      input.targetStatus === "delivered"
        ? "Delivery marked delivered."
        : input.targetStatus === "delivery_failed"
          ? "Delivery marked failed."
          : "Order marked returned.",
    created_at: nowIso,
  });

  return {
    ok: true as const,
    order: updatedOrder,
  };
}
