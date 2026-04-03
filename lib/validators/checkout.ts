import { z } from "zod";

export const checkoutSchema = z.object({
  selectedAddressId: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .regex(/^(\+254|0)\d{9}$/, "Use a valid Kenyan phone e.g. +254712345678"),
  countyId: z.string().min(1, "Select a county"),
  townCenterId: z.string().min(1, "Select a town or center"),
  streetAddress: z.string().min(4, "Street address is required"),
  buildingOrHouse: z.string().optional(),
  landmark: z.string().optional(),
  saveAddress: z.boolean().optional(),
  paymentMethod: z.enum(["mpesa", "card", "cash"]),
  promoCode: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
