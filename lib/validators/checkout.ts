import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number"),
  line1: z.string().min(4, "Address line is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  saveAddress: z.boolean().optional(),
  paymentMethod: z.enum(["mpesa", "card", "cash"]),
  promoCode: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
