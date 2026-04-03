import {
  Gift,
  Heart,
  Home,
  LayoutGrid,
  MapPin,
  PackageSearch,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

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

export const adminSidebarNav = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Products", href: "/admin/products", icon: Sparkles },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
  { label: "Customers", href: "/admin/customers", icon: UserRound },
  { label: "Coupons", href: "/admin/coupons", icon: Gift },
  { label: "Service Locations", href: "/admin/service-locations", icon: MapPin },
  { label: "Banners", href: "/admin/banners", icon: PackageSearch },
  { label: "Reviews", href: "/admin/reviews", icon: Heart },
];
