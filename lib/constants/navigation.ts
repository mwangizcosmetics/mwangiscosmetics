import {
  ClipboardList,
  Crown,
  Truck,
  Gift,
  Heart,
  Home,
  LayoutGrid,
  MapPin,
  PackageSearch,
  Percent,
  ShoppingBag,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import type { PlatformPermission } from "@/lib/services/rbac";

export const storefrontNavLinks = [
  { label: "Shop", href: "/shop", icon: LayoutGrid },
  { label: "Categories", href: "/shop#categories", icon: Sparkles },
  { label: "Offers", href: "/shop?tag=offer", icon: Gift },
  { label: "Orders", href: "/orders", icon: PackageSearch },
];

export const mobileBottomNav = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: LayoutGrid },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: UserRound },
];

export interface AdminSidebarItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
  requiredPermission: PlatformPermission;
}

export const adminSidebarNav: AdminSidebarItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutGrid, requiredPermission: "admin:access" },
  { label: "Products", href: "/admin/products", icon: Sparkles, requiredPermission: "admin:products_management" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, requiredPermission: "admin:orders_read" },
  { label: "Delivery Ops", href: "/admin/delivery", icon: Truck, requiredPermission: "admin:delivery_management" },
  { label: "Service Locations", href: "/admin/service-locations", icon: MapPin, requiredPermission: "admin:delivery_management" },
  { label: "Refunds", href: "/admin/refunds", icon: Heart, requiredPermission: "admin:refunds_manage" },
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid, requiredPermission: "admin:products_management" },
  { label: "Banners", href: "/admin/banners", icon: PackageSearch, requiredPermission: "admin:products_management" },
  { label: "Reviews", href: "/admin/reviews", icon: ClipboardList, requiredPermission: "admin:orders_read" },
  { label: "Pending Payments", href: "/admin/pending-payments", icon: Wallet, requiredPermission: "admin:financials" },
  { label: "Payment Logs", href: "/admin/payment-logs", icon: Wallet, requiredPermission: "admin:payment_logs" },
  { label: "Coupons", href: "/admin/coupons", icon: Gift, requiredPermission: "admin:coupons" },
  { label: "Discounts", href: "/admin/discounts", icon: Percent, requiredPermission: "admin:discounts" },
  { label: "Customers", href: "/admin/customers", icon: UserRound, requiredPermission: "admin:customers" },
  { label: "Staff", href: "/admin/staff", icon: Crown, requiredPermission: "admin:staff_management" },
];
