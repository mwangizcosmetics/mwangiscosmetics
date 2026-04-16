"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  categories as seedCategories,
  coupons as seedCoupons,
  homepageBanners as seedBanners,
  products as seedProducts,
  sampleOrders as seedOrders,
} from "@/lib/data/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  Banner,
  Category,
  Coupon,
  DiscountAuditLog,
  DiscountRule,
  DiscountScope,
  Order,
  OrderEvent,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentRecord,
  PaymentRecordStatus,
  Product,
  RefundRequest,
} from "@/lib/types/ecommerce";
import { slugify } from "@/lib/utils/format";

const nowIso = () => new Date().toISOString();

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

function buildOrderEventMessage(status: OrderStatus) {
  switch (status) {
    case "pending_payment":
      return "Order created and awaiting payment";
    case "failed_payment":
      return "Payment failed";
    case "refund_requested":
      return "Refund requested";
    case "confirmed":
      return "Order confirmed";
    case "preparing":
      return "Order is being prepared";
    case "left_shop":
      return "Order has left the shop";
    case "in_transit":
      return "Order is in transit";
    case "out_for_delivery":
      return "Order is out for delivery";
    case "delivered":
      return "Order delivered successfully";
    case "cancelled":
      return "Order was cancelled";
    case "refunded":
      return "Order has been refunded";
    case "pending":
      return "Order pending confirmation";
    case "paid":
      return "Payment received";
    case "processing":
      return "Order processing started";
    case "shipped":
      return "Order shipped";
    default:
      return "Order status updated";
  }
}

function normalizeOrderStatus(status: OrderStatus): OrderStatus {
  switch (status) {
    case "shipped":
      return "in_transit";
    case "processing":
      return "preparing";
    case "paid":
      return "confirmed";
    default:
      return status;
  }
}

const seededCategories: Category[] = seedCategories.map((category) => ({
  ...category,
  isActive: true,
  createdAt: "2026-04-03T08:00:00.000Z",
  updatedAt: "2026-04-03T08:00:00.000Z",
}));

const seededProducts: Product[] = seedProducts.map((product) => ({
  ...product,
  isActive: true,
  createdAt: "2026-04-03T08:00:00.000Z",
  updatedAt: "2026-04-03T08:00:00.000Z",
}));

const seededCoupons: Coupon[] = seedCoupons.map((coupon) => ({
  ...coupon,
  createdAt: "2026-04-03T08:00:00.000Z",
  updatedAt: "2026-04-03T08:00:00.000Z",
  usageCount: 0,
}));

const seededBanners: Banner[] = seedBanners.map((banner, index) => ({
  ...banner,
  position: index + 1,
  createdAt: "2026-04-03T08:00:00.000Z",
  updatedAt: "2026-04-03T08:00:00.000Z",
}));

const seededDiscountRules: DiscountRule[] = [];
const seededDiscountAuditLogs: DiscountAuditLog[] = [];

const seededOrders: Order[] = seedOrders.map((order) => ({
  ...order,
  status: normalizeOrderStatus(order.status),
  paymentStatus: "success",
  inventoryCommittedAt: order.placedAt,
}));

const seededOrderEvents: OrderEvent[] = seededOrders.map((order, index) => ({
  id: `evt-seed-${index}-${order.id}`,
  orderId: order.id,
  eventType: order.status,
  message: buildOrderEventMessage(order.status),
  createdAt: order.placedAt,
}));

const seededPayments: PaymentRecord[] = seededOrders.map((order, index) => ({
  id: `pay-seed-${index}-${order.id}`,
  orderId: order.id,
  userId: order.userId,
  method: (order.paymentMethod as PaymentMethod) ?? "mpesa",
  provider: "cash_manual",
  status: "success",
  amount: order.total,
  currency: order.currency,
  providerReference: `SEED-${order.orderNumber}`,
  createdAt: order.placedAt,
  updatedAt: order.placedAt,
  confirmedAt: order.placedAt,
}));

interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
}

interface UpdateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

interface CreateProductInput {
  name: string;
  slug?: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  brand?: string;
  imageUrls: string[];
  isFeatured: boolean;
}

interface UpdateProductInput extends CreateProductInput {
  isActive: boolean;
}

interface CreateCouponInput {
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minSubtotal?: number;
  usageLimit?: number;
  expiresAt?: string;
}

interface UpdateCouponInput extends CreateCouponInput {
  active: boolean;
}

interface CreateBannerInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  href?: string;
  badge?: string;
}

interface UpdateBannerInput extends CreateBannerInput {
  active: boolean;
  position: number;
}

interface UpsertDiscountRuleInput {
  scope: DiscountScope;
  percent: number;
  isActive: boolean;
  targetCategorySlug?: string;
  targetProductId?: string;
}

interface PlaceOrderInput {
  userId: string;
  items: Order["items"];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: Order["shippingAddress"];
  deliverySnapshot?: Order["deliverySnapshot"];
}

interface CreateRefundInput {
  orderId: string;
  userId: string;
  reason: string;
  note?: string;
}

interface UpsertPaymentInput {
  orderId: string;
  userId: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentRecordStatus;
  amount: number;
  currency: Order["currency"];
  phone?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  providerReference?: string;
  rawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

interface CommerceStore {
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  banners: Banner[];
  discountRules: DiscountRule[];
  discountAuditLogs: DiscountAuditLog[];
  orders: Order[];
  payments: PaymentRecord[];
  refunds: RefundRequest[];
  orderEvents: OrderEvent[];
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  syncBannersFromRemote: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => { ok: boolean; message?: string };
  updateCategory: (
    categoryId: string,
    input: UpdateCategoryInput,
  ) => { ok: boolean; message?: string };
  toggleCategoryActive: (categoryId: string) => void;
  deleteCategory: (categoryId: string) => void;
  createProduct: (input: CreateProductInput) => { ok: boolean; message?: string };
  updateProduct: (
    productId: string,
    input: UpdateProductInput,
  ) => { ok: boolean; message?: string };
  toggleProductActive: (productId: string) => void;
  toggleProductFeatured: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  createCoupon: (input: CreateCouponInput) => { ok: boolean; message?: string };
  updateCoupon: (
    couponId: string,
    input: UpdateCouponInput,
  ) => { ok: boolean; message?: string };
  toggleCouponActive: (couponId: string) => void;
  deleteCoupon: (couponId: string) => void;
  createBanner: (input: CreateBannerInput) => { ok: boolean; message?: string };
  updateBanner: (
    bannerId: string,
    input: UpdateBannerInput,
  ) => { ok: boolean; message?: string };
  toggleBannerActive: (bannerId: string) => void;
  deleteBanner: (bannerId: string) => void;
  reorderBanner: (bannerId: string, position: number) => void;
  upsertDiscountRule: (
    input: UpsertDiscountRuleInput,
  ) => { ok: boolean; message?: string; updatedRule?: DiscountRule; replacedRuleId?: string };
  removeDiscountRule: (ruleId: string) => { ok: boolean; message?: string };
  incrementCouponUsage: (code: string) => void;
  upsertPaymentRecord: (input: UpsertPaymentInput) => { ok: boolean; payment: PaymentRecord };
  confirmOrderPayment: (
    orderId: string,
    input?: {
      paymentReference?: string;
      checkoutRequestId?: string;
      providerReference?: string;
      rawResponse?: Record<string, unknown>;
    },
  ) => { ok: boolean; message?: string };
  failOrderPayment: (
    orderId: string,
    input?: {
      errorMessage?: string;
      checkoutRequestId?: string;
      rawResponse?: Record<string, unknown>;
    },
  ) => { ok: boolean; message?: string };
  placeOrder: (input: PlaceOrderInput) => { ok: boolean; order?: Order; message?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => { ok: boolean };
  createRefundRequest: (
    input: CreateRefundInput,
  ) => { ok: boolean; message?: string; refund?: RefundRequest };
  updateRefund: (
    refundId: string,
    status: RefundRequest["status"],
    adminNote?: string,
  ) => { ok: boolean; message?: string };
}

function hasDuplicateSlug<T extends { id: string; slug: string }>(
  collection: T[],
  slug: string,
  idToIgnore?: string,
) {
  return collection.some(
    (item) => item.slug.toLowerCase() === slug.toLowerCase() && item.id !== idToIgnore,
  );
}

function clampDiscountPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function doesRuleMatch(
  rule: DiscountRule,
  input: {
    scope: DiscountScope;
    targetCategorySlug?: string;
    targetProductId?: string;
  },
) {
  if (rule.scope !== input.scope) {
    return false;
  }
  if (rule.scope === "global") {
    return true;
  }
  if (rule.scope === "category") {
    return rule.targetCategorySlug === input.targetCategorySlug;
  }
  return rule.targetProductId === input.targetProductId;
}

function getAffectedProductIds(
  products: Product[],
  rule: Pick<DiscountRule, "scope" | "targetCategorySlug" | "targetProductId">,
) {
  if (rule.scope === "global") {
    return products.map((product) => product.id);
  }
  if (rule.scope === "category") {
    return products
      .filter((product) => product.categorySlug === rule.targetCategorySlug)
      .map((product) => product.id);
  }
  return rule.targetProductId ? [rule.targetProductId] : [];
}

interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  href: string | null;
  badge: string | null;
  image_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function fetchBannersFromRemote() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id,title,subtitle,cta_label,href,badge,image_url,active,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return null;
    }

    return (data as BannerRow[]).map((row, index) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle ?? "",
      ctaLabel: row.cta_label ?? "",
      href: row.href ?? "",
      badge: row.badge ?? "",
      imageUrl: row.image_url,
      active: row.active,
      position: index + 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return null;
  }
}

async function upsertBannerRemote(banner: Banner) {
  if (!hasSupabaseEnv()) {
    return;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const payload = {
      title: banner.title,
      subtitle: banner.subtitle ?? null,
      cta_label: banner.ctaLabel ?? null,
      href: banner.href ?? null,
      badge: banner.badge ?? null,
      image_url: banner.imageUrl,
      active: banner.active,
      updated_at: nowIso(),
    };

    if (isUuid(banner.id)) {
      await supabase.from("banners").upsert({
        id: banner.id,
        ...payload,
      });
      return;
    }

    const { data: updated } = await supabase
      .from("banners")
      .update(payload)
      .eq("title", banner.title)
      .select("id")
      .limit(1);

    if (!updated?.length) {
      await supabase.from("banners").insert(payload);
    }
  } catch {}
}

async function deleteBannerRemote(bannerId: string) {
  if (!hasSupabaseEnv()) {
    return;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    if (isUuid(bannerId)) {
      await supabase.from("banners").delete().eq("id", bannerId);
      return;
    }

    const localBanner = useCommerceStore.getState().banners.find((banner) => banner.id === bannerId);
    if (!localBanner) {
      return;
    }

    await supabase.from("banners").delete().eq("title", localBanner.title);
  } catch {}
}

function hasSufficientStock(order: Order, products: Product[]) {
  return order.items.every((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return false;
    return product.stock >= item.quantity;
  });
}

export const useCommerceStore = create<CommerceStore>()(
  persist(
    (set, get) => ({
      categories: seededCategories,
      products: seededProducts,
      coupons: seededCoupons,
      banners: seededBanners,
      discountRules: seededDiscountRules,
      discountAuditLogs: seededDiscountAuditLogs,
      orders: seededOrders,
      payments: seededPayments,
      refunds: [],
      orderEvents: seededOrderEvents,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      syncBannersFromRemote: async () => {
        const remoteBanners = await fetchBannersFromRemote();
        if (remoteBanners) {
          set({
            banners: remoteBanners,
          });
          if (remoteBanners.length) {
            return;
          }
        }

        if (!hasSupabaseEnv()) {
          return;
        }

        for (const banner of get().banners) {
          // Backfill remote when the banners table is empty.
          await upsertBannerRemote(banner);
        }

        const syncedBanners = await fetchBannersFromRemote();
        if (syncedBanners) {
          set({
            banners: syncedBanners,
          });
        }
      },
      createCategory: (input) => {
        const name = input.name.trim();
        if (!name) {
          return { ok: false, message: "Category name is required." };
        }

        const slug = slugify(input.slug?.trim() || name);
        if (hasDuplicateSlug(get().categories as Array<{ id: string; slug: string }>, slug)) {
          return { ok: false, message: "Category slug already exists." };
        }

        const now = nowIso();
        const nextCategory: Category = {
          id: createId("cat"),
          name,
          slug,
          description: input.description?.trim() || "",
          image: input.image?.trim() || "",
          productCount: 0,
          featured: false,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ categories: [...state.categories, nextCategory] }));
        return { ok: true };
      },
      updateCategory: (categoryId, input) => {
        const slug = slugify(input.slug?.trim() || input.name);
        if (hasDuplicateSlug(get().categories as Array<{ id: string; slug: string }>, slug, categoryId)) {
          return { ok: false, message: "Category slug already exists." };
        }

        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  name: input.name.trim(),
                  slug,
                  description: input.description?.trim() || "",
                  image: input.image?.trim() || "",
                  isActive: input.isActive,
                  updatedAt: nowIso(),
                }
              : category,
          ),
        }));
        return { ok: true };
      },
      toggleCategoryActive: (categoryId) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId
              ? { ...category, isActive: !category.isActive, updatedAt: nowIso() }
              : category,
          ),
        })),
      deleteCategory: (categoryId) =>
        set((state) => {
          const now = nowIso();
          const deletedCategory = state.categories.find(
            (category) => category.id === categoryId,
          );
          const deletedSlug = deletedCategory?.slug;
          const removedCategoryRules = state.discountRules.filter(
            (rule) =>
              rule.scope === "category" && rule.targetCategorySlug === deletedSlug,
          );

          return {
            categories: state.categories.filter((category) => category.id !== categoryId),
            products: state.products.map((product) =>
              product.categorySlug === deletedSlug
                ? { ...product, isActive: false, updatedAt: now }
                : product,
            ),
            discountRules: state.discountRules.filter(
              (rule) =>
                !(
                  rule.scope === "category" &&
                  rule.targetCategorySlug === deletedSlug
                ),
            ),
            discountAuditLogs: [
              ...removedCategoryRules.map((rule) => ({
                id: createId("dsc-audit"),
                scope: "category" as const,
                action: "delete" as const,
                ruleId: rule.id,
                summary: `Category discount removed after deleting ${deletedSlug}`,
                previousPercent: rule.percent,
                affectedProductIds: getAffectedProductIds(state.products, rule),
                createdAt: now,
              })),
              ...state.discountAuditLogs,
            ].slice(0, 500),
          };
        }),
      createProduct: (input) => {
        const category = get().categories.find(
          (item) => item.slug === input.categorySlug && item.isActive !== false,
        );

        if (!category) {
          return { ok: false, message: "Choose an active category." };
        }

        const slug = slugify(input.slug?.trim() || input.name);
        if (hasDuplicateSlug(get().products as Array<{ id: string; slug: string }>, slug)) {
          return { ok: false, message: "Product slug already exists." };
        }

        const now = nowIso();
        const images = input.imageUrls
          .map((url, index) => ({
            id: createId("img"),
            url,
            alt: input.name,
            isPrimary: index === 0,
          }))
          .filter((image) => image.url.trim().length > 0);

        const nextProduct: Product = {
          id: createId("prd"),
          slug,
          name: input.name.trim(),
          shortDescription: input.shortDescription.trim(),
          description: input.description.trim(),
          brand: input.brand?.trim() || "MWANGIZ Cosmetics",
          categorySlug: category.slug,
          tags: [],
          images,
          price: input.price,
          compareAtPrice: input.compareAtPrice,
          currency: "KES",
          stock: input.stock,
          sku: input.sku?.trim() || `MWZ-${Math.floor(Math.random() * 99999)}`,
          rating: 0,
          ratingCount: 0,
          isFeatured: input.isFeatured,
          isBestSeller: false,
          isNew: true,
          isActive: true,
          highlights: [],
          ingredients: [],
          benefits: [],
          howToUse: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ products: [nextProduct, ...state.products] }));
        return { ok: true };
      },
      updateProduct: (productId, input) => {
        const category = get().categories.find(
          (item) => item.slug === input.categorySlug && item.isActive !== false,
        );
        if (!category) {
          return { ok: false, message: "Choose an active category." };
        }

        const slug = slugify(input.slug?.trim() || input.name);
        if (hasDuplicateSlug(get().products as Array<{ id: string; slug: string }>, slug, productId)) {
          return { ok: false, message: "Product slug already exists." };
        }

        const images = input.imageUrls
          .map((url, index) => ({
            id: createId("img"),
            url,
            alt: input.name,
            isPrimary: index === 0,
          }))
          .filter((image) => image.url.trim().length > 0);

        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  slug,
                  name: input.name.trim(),
                  shortDescription: input.shortDescription.trim(),
                  description: input.description.trim(),
                  categorySlug: category.slug,
                  brand: input.brand?.trim() || "MWANGIZ Cosmetics",
                  price: input.price,
                  compareAtPrice: input.compareAtPrice,
                  stock: input.stock,
                  sku: input.sku?.trim() || product.sku,
                  images: images.length ? images : product.images,
                  isFeatured: input.isFeatured,
                  isActive: input.isActive,
                  updatedAt: nowIso(),
                }
              : product,
          ),
        }));
        return { ok: true };
      },
      toggleProductActive: (productId) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, isActive: !product.isActive, updatedAt: nowIso() }
              : product,
          ),
        })),
      toggleProductFeatured: (productId) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, isFeatured: !product.isFeatured, updatedAt: nowIso() }
              : product,
          ),
        })),
      deleteProduct: (productId) =>
        set((state) => {
          const now = nowIso();
          const removedProductRule = state.discountRules.find(
            (rule) => rule.scope === "product" && rule.targetProductId === productId,
          );
          return {
            products: state.products.filter((product) => product.id !== productId),
            discountRules: state.discountRules.filter(
              (rule) =>
                !(
                  rule.scope === "product" && rule.targetProductId === productId
                ),
            ),
            discountAuditLogs: removedProductRule
              ? [
                  {
                    id: createId("dsc-audit"),
                    scope: "product" as const,
                    action: "delete" as const,
                    ruleId: removedProductRule.id,
                    summary: "Product discount removed after deleting product",
                    previousPercent: removedProductRule.percent,
                    affectedProductIds: [productId],
                    createdAt: now,
                  },
                  ...state.discountAuditLogs,
                ].slice(0, 500)
              : state.discountAuditLogs,
          };
        }),
      createCoupon: (input) => {
        const code = input.code.trim().toUpperCase();
        if (!code) {
          return { ok: false, message: "Coupon code is required." };
        }

        const duplicate = get().coupons.some((coupon) => coupon.code === code);
        if (duplicate) {
          return { ok: false, message: "Coupon code already exists." };
        }

        const now = nowIso();
        const nextCoupon: Coupon = {
          id: createId("cpn"),
          code,
          description: input.description?.trim() || "",
          type: input.type,
          value: input.value,
          minSubtotal: input.minSubtotal,
          usageLimit: input.usageLimit,
          usageCount: 0,
          active: true,
          expiresAt: input.expiresAt,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ coupons: [nextCoupon, ...state.coupons] }));
        return { ok: true };
      },
      updateCoupon: (couponId, input) => {
        const code = input.code.trim().toUpperCase();
        const duplicate = get().coupons.some(
          (coupon) => coupon.code === code && coupon.id !== couponId,
        );
        if (duplicate) {
          return { ok: false, message: "Coupon code already exists." };
        }

        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === couponId
              ? {
                  ...coupon,
                  code,
                  description: input.description?.trim() || "",
                  type: input.type,
                  value: input.value,
                  minSubtotal: input.minSubtotal,
                  usageLimit: input.usageLimit,
                  expiresAt: input.expiresAt,
                  active: input.active,
                  updatedAt: nowIso(),
                }
              : coupon,
          ),
        }));
        return { ok: true };
      },
      toggleCouponActive: (couponId) =>
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === couponId
              ? { ...coupon, active: !coupon.active, updatedAt: nowIso() }
              : coupon,
          ),
        })),
      deleteCoupon: (couponId) =>
        set((state) => ({
          coupons: state.coupons.filter((coupon) => coupon.id !== couponId),
        })),
      createBanner: (input) => {
        const now = nowIso();
        const position = get().banners.length + 1;

        const nextBanner: Banner = {
          id: createId("bnr"),
          title: input.title.trim(),
          subtitle: input.subtitle?.trim() || "",
          ctaLabel: input.ctaLabel?.trim() || "",
          href: input.href?.trim() || "",
          badge: input.badge?.trim() || "",
          imageUrl: input.imageUrl.trim(),
          position,
          active: true,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ banners: [...state.banners, nextBanner] }));
        void upsertBannerRemote(nextBanner);
        return { ok: true };
      },
      updateBanner: (bannerId, input) => {
        let updatedBanner: Banner | undefined;
        set((state) => ({
          banners: state.banners.map((banner) =>
            banner.id === bannerId
              ? (() => {
                  updatedBanner = {
                    ...banner,
                    title: input.title.trim(),
                    subtitle: input.subtitle?.trim() || "",
                    ctaLabel: input.ctaLabel?.trim() || "",
                    href: input.href?.trim() || "",
                    badge: input.badge?.trim() || "",
                    imageUrl: input.imageUrl.trim(),
                    position: input.position,
                    active: input.active,
                    updatedAt: nowIso(),
                  };
                  return updatedBanner;
                })()
              : banner,
          ),
        }));
        if (updatedBanner) {
          void upsertBannerRemote(updatedBanner);
        }
        return { ok: true };
      },
      toggleBannerActive: (bannerId) => {
        let updatedBanner: Banner | undefined;
        set((state) => ({
          banners: state.banners.map((banner) =>
            banner.id === bannerId
              ? (() => {
                  updatedBanner = {
                    ...banner,
                    active: !banner.active,
                    updatedAt: nowIso(),
                  };
                  return updatedBanner;
                })()
              : banner,
          ),
        }));
        if (updatedBanner) {
          void upsertBannerRemote(updatedBanner);
        }
      },
      deleteBanner: (bannerId) => {
        set((state) => ({
          banners: state.banners.filter((banner) => banner.id !== bannerId),
        }));
        void deleteBannerRemote(bannerId);
      },
      reorderBanner: (bannerId, position) => {
        let updatedBanner: Banner | undefined;
        set((state) => ({
          banners: state.banners.map((banner) =>
            banner.id === bannerId
              ? (() => {
                  updatedBanner = { ...banner, position, updatedAt: nowIso() };
                  return updatedBanner;
                })()
              : banner,
          ),
        }));
        if (updatedBanner) {
          void upsertBannerRemote(updatedBanner);
        }
      },
      upsertDiscountRule: (input) => {
        const normalizedPercent = clampDiscountPercent(input.percent);
        if (normalizedPercent < 0 || normalizedPercent > 100) {
          return {
            ok: false,
            message: "Discount percent must be between 0 and 100.",
          };
        }

        if (input.scope === "category" && !input.targetCategorySlug) {
          return {
            ok: false,
            message: "Select a category to apply category discount.",
          };
        }

        if (input.scope === "product" && !input.targetProductId) {
          return {
            ok: false,
            message: "Select a product to apply product discount.",
          };
        }

        const now = nowIso();
        const state = get();
        const existing = state.discountRules.find((rule) =>
          doesRuleMatch(rule, {
            scope: input.scope,
            targetCategorySlug: input.targetCategorySlug,
            targetProductId: input.targetProductId,
          }),
        );

        let updatedRule: DiscountRule;
        if (existing) {
          updatedRule = {
            ...existing,
            percent: normalizedPercent,
            isActive: input.isActive,
            updatedAt: now,
          };
        } else {
          updatedRule = {
            id: createId("dsc"),
            scope: input.scope,
            percent: normalizedPercent,
            isActive: input.isActive,
            targetCategorySlug: input.targetCategorySlug,
            targetProductId: input.targetProductId,
            createdAt: now,
            updatedAt: now,
          };
        }

        const affectedProductIds = getAffectedProductIds(state.products, updatedRule);
        const summary =
          input.scope === "global"
            ? `Global discount set to ${normalizedPercent}%`
            : input.scope === "category"
              ? `Category ${updatedRule.targetCategorySlug} discount set to ${normalizedPercent}%`
              : `Product ${updatedRule.targetProductId} discount set to ${normalizedPercent}%`;

        const auditLog: DiscountAuditLog = {
          id: createId("dsc-audit"),
          scope: updatedRule.scope,
          action: existing
            ? input.isActive
              ? "update"
              : "deactivate"
            : input.isActive
              ? "create"
              : "deactivate",
          ruleId: updatedRule.id,
          summary,
          previousPercent: existing?.percent,
          nextPercent: updatedRule.percent,
          affectedProductIds,
          createdAt: now,
        };

        set((current) => ({
          discountRules: existing
            ? current.discountRules.map((rule) =>
                rule.id === existing.id ? updatedRule : rule,
              )
            : [updatedRule, ...current.discountRules],
          discountAuditLogs: [auditLog, ...current.discountAuditLogs].slice(0, 500),
        }));

        return {
          ok: true,
          updatedRule,
          replacedRuleId: existing?.id,
        };
      },
      removeDiscountRule: (ruleId) => {
        const existing = get().discountRules.find((rule) => rule.id === ruleId);
        if (!existing) {
          return { ok: false, message: "Discount rule not found." };
        }

        const now = nowIso();
        set((state) => ({
          discountRules: state.discountRules.filter((rule) => rule.id !== ruleId),
          discountAuditLogs: [
            {
              id: createId("dsc-audit"),
              scope: existing.scope,
              action: "delete" as const,
              ruleId,
              summary: "Discount rule removed",
              previousPercent: existing.percent,
              affectedProductIds: getAffectedProductIds(state.products, existing),
              createdAt: now,
            },
            ...state.discountAuditLogs,
          ].slice(0, 500),
        }));

        return { ok: true };
      },
      incrementCouponUsage: (code) =>
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.code.toUpperCase() === code.toUpperCase()
              ? {
                  ...coupon,
                  usageCount: (coupon.usageCount ?? 0) + 1,
                  updatedAt: nowIso(),
                }
              : coupon,
          ),
        })),
      upsertPaymentRecord: (input) => {
        const now = nowIso();
        const existing = get().payments.find((payment) => {
          if (input.checkoutRequestId && payment.checkoutRequestId) {
            return payment.checkoutRequestId === input.checkoutRequestId;
          }
          return (
            payment.orderId === input.orderId &&
            payment.method === input.method &&
            payment.status !== "success"
          );
        });

        const paymentRecord: PaymentRecord = existing
          ? {
              ...existing,
              ...input,
              id: existing.id,
              updatedAt: now,
              confirmedAt:
                input.status === "success" ? existing.confirmedAt ?? now : existing.confirmedAt,
            }
          : {
              id: createId("pay"),
              ...input,
              createdAt: now,
              updatedAt: now,
              confirmedAt: input.status === "success" ? now : undefined,
            };

        set((state) => ({
          payments: existing
            ? state.payments.map((payment) =>
                payment.id === existing.id ? paymentRecord : payment,
              )
            : [paymentRecord, ...state.payments],
        }));

        return { ok: true, payment: paymentRecord };
      },
      confirmOrderPayment: (orderId, input) => {
        const state = get();
        const order = state.orders.find((candidate) => candidate.id === orderId);
        if (!order) {
          return { ok: false, message: "Order not found." };
        }

        if (order.paymentStatus === "success" || order.inventoryCommittedAt) {
          return { ok: true };
        }

        if (!hasSufficientStock(order, state.products)) {
          return {
            ok: false,
            message: "Stock changed before payment confirmation. Review inventory.",
          };
        }

        const now = nowIso();
        set((current) => ({
          products: current.products.map((product) => {
            const item = order.items.find((orderItem) => orderItem.productId === product.id);
            if (!item) {
              return product;
            }

            const nextStock = Math.max(product.stock - item.quantity, 0);
            return {
              ...product,
              stock: nextStock,
              updatedAt: now,
            };
          }),
          orders: current.orders.map((candidate) =>
            candidate.id === orderId
              ? {
                  ...candidate,
                  status: "paid",
                  paymentStatus: "success",
                  paymentReference:
                    input?.paymentReference ??
                    input?.providerReference ??
                    candidate.paymentReference,
                  inventoryCommittedAt: now,
                }
              : candidate,
          ),
          orderEvents: [
            {
              id: createId("evt"),
              orderId,
              eventType: "paid",
              message: "Payment confirmed and inventory committed",
              createdAt: now,
            },
            ...current.orderEvents,
          ],
        }));

        return { ok: true };
      },
      failOrderPayment: (orderId, input) => {
        const order = get().orders.find((candidate) => candidate.id === orderId);
        if (!order) {
          return { ok: false, message: "Order not found." };
        }

        const now = nowIso();
        set((state) => ({
          orders: state.orders.map((candidate) =>
            candidate.id === orderId
              ? {
                  ...candidate,
                  status: "failed_payment",
                  paymentStatus: "failed",
                }
              : candidate,
          ),
          orderEvents: [
            {
              id: createId("evt"),
              orderId,
              eventType: "failed_payment",
              message: input?.errorMessage ?? "Payment failed",
              createdAt: now,
            },
            ...state.orderEvents,
          ],
        }));

        return { ok: true };
      },
      placeOrder: (input) => {
        const products = get().products;
        for (const item of input.items) {
          const product = products.find((candidate) => candidate.id === item.productId);
          if (!product) {
            return { ok: false, message: "A product in your cart is no longer available." };
          }
          if (product.stock < item.quantity) {
            return {
              ok: false,
              message: `${product.name} only has ${product.stock} item(s) left in stock.`,
            };
          }
        }

        const now = nowIso();
        const nextOrder: Order = {
          id: createId("ord"),
          orderNumber: `MWZ-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: input.userId,
          status: "pending_payment",
          items: input.items,
          subtotal: input.subtotal,
          discount: input.discount,
          shipping: input.shipping,
          tax: input.tax,
          total: input.total,
          currency: "KES",
          placedAt: now,
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          deliverySnapshot: input.deliverySnapshot,
          paymentStatus: "pending",
        };

        const event: OrderEvent = {
          id: createId("evt"),
          orderId: nextOrder.id,
          eventType: "pending_payment",
          message: "Order created. Awaiting payment confirmation.",
          createdAt: now,
        };

        set((state) => ({
          orders: [nextOrder, ...state.orders],
          orderEvents: [event, ...state.orderEvents],
        }));

        return { ok: true, order: nextOrder };
      },
      updateOrderStatus: (orderId, status) => {
        const order = get().orders.find((candidate) => candidate.id === orderId);
        if (!order) {
          return { ok: false };
        }

        const paymentOptionalStatuses: OrderStatus[] = [
          "pending_payment",
          "failed_payment",
          "cancelled",
        ];
        if (order.paymentStatus !== "success" && !paymentOptionalStatuses.includes(status)) {
          return { ok: false };
        }

        const event: OrderEvent = {
          id: createId("evt"),
          orderId,
          eventType: status,
          message: buildOrderEventMessage(status),
          createdAt: nowIso(),
        };

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  paymentStatus:
                    status === "refunded"
                      ? "refunded"
                      : status === "failed_payment"
                        ? "failed"
                        : order.paymentStatus,
                }
              : order,
          ),
          orderEvents: [event, ...state.orderEvents],
        }));
        return { ok: true };
      },
      createRefundRequest: (input) => {
        const existing = get().refunds.find((refund) => refund.orderId === input.orderId);
        if (existing) {
          return { ok: false, message: "Refund request already exists for this order." };
        }

        const now = nowIso();
        const refund: RefundRequest = {
          id: createId("rfd"),
          orderId: input.orderId,
          userId: input.userId,
          reason: input.reason,
          note: input.note,
          status: "requested",
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          refunds: [refund, ...state.refunds],
          orders: state.orders.map((order) =>
            order.id === input.orderId
              ? {
                  ...order,
                  status: "refund_requested",
                }
              : order,
          ),
          orderEvents: [
            {
              id: createId("evt"),
              orderId: input.orderId,
              eventType: "refund_requested",
              message: "Refund requested by customer",
              createdAt: now,
            },
            ...state.orderEvents,
          ],
        }));
        return { ok: true, refund };
      },
      updateRefund: (refundId, status, adminNote) => {
        const current = get().refunds.find((refund) => refund.id === refundId);
        if (!current) {
          return { ok: false, message: "Refund not found." };
        }

        const currentOrder = get().orders.find((order) => order.id === current.orderId);

        set((state) => ({
          refunds: state.refunds.map((refund) =>
            refund.id === refundId
              ? {
                  ...refund,
                  status,
                  adminNote: adminNote?.trim() || refund.adminNote,
                  updatedAt: nowIso(),
                }
              : refund,
          ),
          products:
            status === "refunded" && currentOrder?.inventoryCommittedAt
              ? state.products.map((product) => {
                  const refundedItem = currentOrder.items.find(
                    (item) => item.productId === product.id,
                  );
                  if (!refundedItem) {
                    return product;
                  }

                  return {
                    ...product,
                    stock: product.stock + refundedItem.quantity,
                    updatedAt: nowIso(),
                  };
                })
              : state.products,
          orders:
            status === "refunded"
              ? state.orders.map((order) =>
                  order.id === current.orderId
                    ? {
                        ...order,
                        status: "refunded",
                        paymentStatus: "refunded",
                        inventoryCommittedAt: undefined,
                      }
                    : order,
                )
              : state.orders,
          orderEvents:
            status === "refunded"
              ? [
                  {
                    id: createId("evt"),
                    orderId: current.orderId,
                    eventType: "refunded",
                    message: "Order refunded",
                    createdAt: nowIso(),
                  },
                  ...state.orderEvents,
                ]
              : state.orderEvents,
        }));
        return { ok: true };
      },
    }),
    {
      name: "mwangiz-commerce-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        categories: state.categories,
        products: state.products,
        coupons: state.coupons,
        banners: state.banners,
        discountRules: state.discountRules,
        discountAuditLogs: state.discountAuditLogs,
        orders: state.orders,
        payments: state.payments,
        refunds: state.refunds,
        orderEvents: state.orderEvents,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
