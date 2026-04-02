import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(64, "Password is too long"),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Please enter your full name")
      .max(60, "Name is too long"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must have at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/[0-9]/, "Add at least one number"),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((value) => value, {
      message: "You must accept terms to continue",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
