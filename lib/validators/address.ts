import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(20, "Label is too long").optional(),
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+254|0)\d{9}$/, "Use a valid Kenyan phone e.g. +254712345678"),
  countyId: z.string().min(1, "Select a county"),
  townCenterId: z.string().min(1, "Select a town or center"),
  streetAddress: z.string().trim().min(4, "Street address is required"),
  buildingOrHouse: z.string().trim().max(80, "Building details are too long").optional(),
  landmark: z.string().trim().max(120, "Landmark details are too long").optional(),
  isPrimary: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
