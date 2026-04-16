import type { Database } from "@/lib/supabase/database.types";
import type { NormalizedRole } from "@/lib/services/rbac";

export type DbOrderStatus = Database["public"]["Enums"]["order_status"];

export type DeliveryPipelineStatus =
  | "confirmed"
  | "paid"
  | "ready_for_dispatch"
  | "in_transit"
  | "delivered"
  | "delivery_failed"
  | "returned";

export const customerDeliveryFlow: DeliveryPipelineStatus[] = [
  "confirmed",
  "paid",
  "ready_for_dispatch",
  "in_transit",
  "delivered",
];

export const recoverableDeliveryExceptions: DeliveryPipelineStatus[] = [
  "delivery_failed",
  "returned",
];

const allowedTransitions: Record<DeliveryPipelineStatus, DeliveryPipelineStatus[]> = {
  confirmed: ["ready_for_dispatch"],
  paid: ["ready_for_dispatch"],
  ready_for_dispatch: ["in_transit"],
  in_transit: ["delivered", "delivery_failed"],
  delivered: [],
  delivery_failed: ["returned"],
  returned: [],
};

export function isDeliveryPipelineStatus(status: DbOrderStatus): status is DeliveryPipelineStatus {
  return (
    status === "confirmed" ||
    status === "paid" ||
    status === "ready_for_dispatch" ||
    status === "in_transit" ||
    status === "delivered" ||
    status === "delivery_failed" ||
    status === "returned"
  );
}

export function canMarkReadyForDispatch(input: {
  status: DbOrderStatus;
  paymentStatus: "pending" | "success" | "failed" | "refunded";
}) {
  return (
    (input.status === "paid" || input.status === "confirmed") &&
    input.paymentStatus === "success"
  );
}

export function canClaimForDelivery(status: DbOrderStatus) {
  return status === "ready_for_dispatch";
}

export function canTransitionDeliveryStatus(input: {
  from: DbOrderStatus;
  to: DbOrderStatus;
  actorRole: NormalizedRole;
  isAssignedAgent: boolean;
}) {
  if (!isDeliveryPipelineStatus(input.from) || !isDeliveryPipelineStatus(input.to)) {
    return false;
  }

  if (!allowedTransitions[input.from].includes(input.to)) {
    return false;
  }

  if (input.actorRole === "super_admin") {
    return true;
  }

  if (input.actorRole === "staff_admin") {
    return input.from === "confirmed" || input.from === "paid";
  }

  if (input.actorRole === "beba") {
    if (!input.isAssignedAgent) {
      return false;
    }
    return input.from === "in_transit";
  }

  return false;
}

export function minutesSince(isoTimestamp: string | null | undefined) {
  if (!isoTimestamp) {
    return null;
  }
  const value = Date.parse(isoTimestamp);
  if (Number.isNaN(value)) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - value) / 60000));
}
