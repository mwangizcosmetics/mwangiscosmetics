export type PlatformRole =
  | "customer"
  | "super_admin"
  | "staff_admin"
  | "beba"
  | "admin";

export type NormalizedRole = "customer" | "super_admin" | "staff_admin" | "beba";

export type PlatformPermission =
  | "admin:access"
  | "admin:financials"
  | "admin:payment_logs"
  | "admin:coupons"
  | "admin:discounts"
  | "admin:customers"
  | "admin:staff_management"
  | "admin:delivery_management"
  | "admin:inventory_management"
  | "admin:products_management"
  | "admin:orders_read"
  | "admin:refunds_manage"
  | "admin:mark_ready_for_dispatch"
  | "beba:access"
  | "beba:claim_delivery"
  | "beba:update_delivery_status";

const rolePermissions: Record<NormalizedRole, PlatformPermission[]> = {
  customer: [],
  super_admin: [
    "admin:access",
    "admin:financials",
    "admin:payment_logs",
    "admin:coupons",
    "admin:discounts",
    "admin:customers",
    "admin:staff_management",
    "admin:delivery_management",
    "admin:inventory_management",
    "admin:products_management",
    "admin:orders_read",
    "admin:refunds_manage",
    "admin:mark_ready_for_dispatch",
  ],
  staff_admin: [
    "admin:access",
    "admin:delivery_management",
    "admin:inventory_management",
    "admin:products_management",
    "admin:orders_read",
    "admin:refunds_manage",
    "admin:mark_ready_for_dispatch",
  ],
  beba: [
    "beba:access",
    "beba:claim_delivery",
    "beba:update_delivery_status",
  ],
};

export function normalizeRole(role: string | null | undefined): NormalizedRole {
  if (!role) {
    return "customer";
  }

  const normalized = role.toLowerCase();
  if (normalized === "super_admin") {
    return "super_admin";
  }
  if (normalized === "staff_admin") {
    return "staff_admin";
  }
  if (normalized === "beba") {
    return "beba";
  }
  if (normalized === "admin") {
    // Legacy admin maps to super admin capability.
    return "super_admin";
  }
  return "customer";
}

export function hasPermission(
  role: string | null | undefined,
  permission: PlatformPermission,
) {
  const normalized = normalizeRole(role);
  return rolePermissions[normalized].includes(permission);
}

export function isAdminOpsRole(role: string | null | undefined) {
  return hasPermission(role, "admin:access");
}

export function isSuperAdminRole(role: string | null | undefined) {
  return normalizeRole(role) === "super_admin";
}

export function isStaffAdminRole(role: string | null | undefined) {
  return normalizeRole(role) === "staff_admin";
}

export function isBebaRole(role: string | null | undefined) {
  return normalizeRole(role) === "beba";
}

export function getRoleDefaultPath(role: string | null | undefined) {
  const normalized = normalizeRole(role);
  if (normalized === "beba") {
    return "/beba";
  }
  if (normalized === "super_admin" || normalized === "staff_admin") {
    return "/admin";
  }
  return "/account";
}
