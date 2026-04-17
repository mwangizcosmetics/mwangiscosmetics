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
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EtaUnit = "hours" | "days";

export interface ServiceCounty {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTown {
  id: string;
  countyId: string;
  name: string;
  isActive: boolean;
  etaMinValue?: number | null;
  etaMaxValue?: number | null;
  etaUnit?: EtaUnit | null;
  estimatedDeliveryDays?: number | null;
  deliveryFee?: number | null;
  createdAt: string;
  updatedAt: string;
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
  categoryId?: string;
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
  isActive?: boolean;
  highlights: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type DiscountScope = "global" | "category" | "product";

export interface DiscountRule {
  id: string;
  scope: DiscountScope;
  percent: number;
  isActive: boolean;
  targetCategorySlug?: string;
  targetProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountAuditLog {
  id: string;
  scope: DiscountScope;
  action: "create" | "update" | "delete" | "activate" | "deactivate";
  ruleId?: string;
  summary: string;
  previousPercent?: number;
  nextPercent?: number;
  affectedProductIds: string[];
  createdAt: string;
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
  | "pending_payment"
  | "payment_init_failed"
  | "failed_payment"
  | "refund_requested"
  | "confirmed"
  | "paid"
  | "ready_for_dispatch"
  | "preparing"
  | "left_shop"
  | "in_transit"
  | "out_for_delivery"
  | "delivery_failed"
  | "returned"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type UserRole =
  | "customer"
  | "super_admin"
  | "staff_admin"
  | "beba"
  | "admin";

export interface Address {
  id: string;
  userId: string;
  label?: string;
  fullName: string;
  phone: string;
  email?: string;
  countyId: string;
  county: string;
  townCenterId: string;
  townCenter: string;
  streetAddress: string;
  buildingOrHouse?: string;
  landmark?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
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
  deliverySnapshot?: {
    county: string;
    townCenter: string;
    deliveryFee: number;
    etaMinValue?: number | null;
    etaMaxValue?: number | null;
    etaUnit?: EtaUnit | null;
    etaText: string;
  };
  paymentMethod: string;
  paymentStatus?: "pending" | "success" | "failed" | "refunded";
  paymentReference?: string;
  inventoryCommittedAt?: string;
  deliveryAgentId?: string;
  readyForDispatchAt?: string;
  inTransitAt?: string;
  deliveredAt?: string;
  deliveryFailedAt?: string;
  returnedAt?: string;
  dispatchNote?: string;
  deliveryNote?: string;
}

export type PaymentMethod = "mpesa" | "card" | "cash";

export type PaymentProvider = "mpesa_daraja" | "card_placeholder" | "cash_manual";

export type PaymentRecordStatus =
  | "initiated"
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "timed_out"
  | "init_failed";

export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentRecordStatus;
  amount: number;
  currency: CurrencyCode;
  phone?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  providerReference?: string;
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
  isActive?: boolean;
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
  usageLimit?: number;
  usageCount?: number;
  active: boolean;
  isDeleted?: boolean;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  href?: string;
  badge?: string;
  imageUrl: string;
  position?: number;
  active: boolean;
  isDeleted?: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteAnnouncement {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  note?: string;
  status: "requested" | "under_review" | "approved" | "declined" | "refunded";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  eventType: string;
  message: string;
  createdAt: string;
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
