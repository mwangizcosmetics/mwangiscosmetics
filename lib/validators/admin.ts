import { z } from "zod";

export const adminCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const adminProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().optional(),
  categorySlug: z.string().min(1, "Select a category"),
  shortDescription: z.string().min(6, "Short description is required"),
  description: z.string().min(10, "Full description is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  compareAtPrice: z.preprocess(
    (value) =>
      value === "" || value === null || Number.isNaN(value)
        ? undefined
        : Number(value),
    z.number().min(0).optional(),
  ),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  imageUrls: z.string().min(5, "Enter at least one image URL"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const adminCouponSchema = z.object({
  code: z.string().min(3, "Coupon code is required"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive("Discount value must be greater than 0"),
  minSubtotal: z.preprocess(
    (value) =>
      value === "" || value === null || Number.isNaN(value)
        ? undefined
        : Number(value),
    z.number().min(0).optional(),
  ),
  usageLimit: z.preprocess(
    (value) =>
      value === "" || value === null || Number.isNaN(value)
        ? undefined
        : Number(value),
    z.number().int().min(1).optional(),
  ),
  expiresAt: z.string().optional(),
  active: z.boolean().default(true),
});

export const adminBannerSchema = z.object({
  title: z.string().min(3, "Banner title is required"),
  subtitle: z.string().optional(),
  imageUrl: z.string().url("Enter a valid image URL"),
  ctaLabel: z.string().optional(),
  href: z.string().optional(),
  badge: z.string().optional(),
  position: z.number().int().min(1),
  active: z.boolean().default(true),
});

export const adminRefundUpdateSchema = z.object({
  status: z.enum(["under_review", "approved", "declined", "refunded"]),
  adminNote: z.string().optional(),
});

export type AdminCategoryValues = z.infer<typeof adminCategorySchema>;
export type AdminProductValues = z.infer<typeof adminProductSchema>;
export type AdminCouponValues = z.infer<typeof adminCouponSchema>;
export type AdminBannerValues = z.infer<typeof adminBannerSchema>;
export type AdminRefundUpdateValues = z.infer<typeof adminRefundUpdateSchema>;
