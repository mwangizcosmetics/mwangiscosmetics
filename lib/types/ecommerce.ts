export type CurrencyCode = "KES" | "USD";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  brand: string;
  categorySlug: string;
  tags: string[];
  images: ProductImage[];
  price: number;
  compareAtPrice?: number;
  currency: CurrencyCode;
  stock: number;
  sku: string;
  rating: number;
  ratingCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  highlights: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedShade?: string;
}

export interface WishlistItem {
  productId: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productSnapshot: {
    name: string;
    image: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: CurrencyCode;
  placedAt: string;
  estimatedDelivery?: string;
  shippingAddress: Address;
  paymentMethod: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  loyaltyTier: "Classic" | "Glow" | "Velvet";
  defaultAddress?: Address;
  savedAddresses: Address[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minSubtotal?: number;
  active: boolean;
  expiresAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  href?: string;
  badge?: string;
  imageUrl: string;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  text: string;
  rating: number;
  skinType?: string;
}

export interface AdminStat {
  id: string;
  title: string;
  value: string;
  trend: string;
  change: number;
}
