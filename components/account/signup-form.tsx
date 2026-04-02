"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

import { signUpWithEmail } from "@/lib/supabase/auth";
import { signupSchema, type SignupFormValues } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const onSubmit = async (values: SignupFormValues) => {
    const { error } = await signUpWithEmail(values);

    if (error) {
      toast.error(error.message || "Unable to create account");
      return;
    }

    toast.success("Account created. Check your email for verification.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" placeholder="Jane Mwangi" {...register("fullName")} />
        {errors.fullName ? <p className="text-xs text-[#a11f2f]">{errors.fullName.message}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email ? <p className="text-xs text-[#a11f2f]">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+254..." {...register("phone")} />
          {errors.phone ? <p className="text-xs text-[#a11f2f]">{errors.phone.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Create password" {...register("password")} />
        {errors.password ? <p className="text-xs text-[#a11f2f]">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" placeholder="Confirm password" {...register("confirmPassword")} />
        {errors.confirmPassword ? <p className="text-xs text-[#a11f2f]">{errors.confirmPassword.message}</p> : null}
      </div>
      <label className="flex items-start gap-2 rounded-2xl bg-[var(--surface-alt)] p-3">
        <Checkbox
          checked={termsAccepted}
          onCheckedChange={(checked) => {
            const nextValue = Boolean(checked);
            setTermsAccepted(nextValue);
            setValue("termsAccepted", nextValue);
          }}
        />
        <span className="text-sm text-[var(--foreground-muted)]">
          I agree to MWANGIZ Cosmetics terms and privacy policy.
        </span>
      </label>
      {errors.termsAccepted ? <p className="text-xs text-[#a11f2f]">{errors.termsAccepted.message}</p> : null}
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
