"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";

export function CheckoutAddressForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "Jane Mwangi",
      email: "jane.mwangi@example.com",
      phone: "+254712345678",
      line1: "Kindaruma Rd",
      city: "Nairobi",
      region: "Nairobi County",
      country: "Kenya",
      paymentMethod: "mpesa",
      saveAddress: true,
    },
  });

  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutFormValues["paymentMethod"]>("mpesa");
  const [saveAddress, setSaveAddress] = useState(true);

  const onSubmit = async () => {
    toast.success("Checkout details captured. Connect payment and order API next.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Delivery details</h2>
        <p className="text-sm text-[var(--foreground-muted)]">Enter your address and preferred payment method.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Jane Mwangi" {...register("fullName")} />
          {errors.fullName ? <p className="text-xs text-[#a11f2f]">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="jane@example.com" {...register("email")} />
          {errors.email ? <p className="text-xs text-[#a11f2f]">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+254..." {...register("phone")} />
          {errors.phone ? <p className="text-xs text-[#a11f2f]">{errors.phone.message}</p> : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="line1">Address line 1</Label>
          <Input id="line1" placeholder="Street / Building" {...register("line1")} />
          {errors.line1 ? <p className="text-xs text-[#a11f2f]">{errors.line1.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="line2">Address line 2 (optional)</Label>
          <Input id="line2" placeholder="Apartment / Landmark" {...register("line2")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Nairobi" {...register("city")} />
          {errors.city ? <p className="text-xs text-[#a11f2f]">{errors.city.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region / County</Label>
          <Input id="region" placeholder="Nairobi County" {...register("region")} />
          {errors.region ? <p className="text-xs text-[#a11f2f]">{errors.region.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" placeholder="Kenya" {...register("country")} />
          {errors.country ? <p className="text-xs text-[#a11f2f]">{errors.country.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Payment method</Label>
        <Select
          value={paymentMethod}
          onValueChange={(value) => {
            const typedValue = value as CheckoutFormValues["paymentMethod"];
            setPaymentMethod(typedValue);
            setValue("paymentMethod", typedValue);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="card">Card payment</SelectItem>
            <SelectItem value="cash">Cash on delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-start gap-2 rounded-2xl bg-[var(--surface-alt)] p-3">
        <Checkbox
          checked={saveAddress}
          onCheckedChange={(checked) => {
            const nextValue = Boolean(checked);
            setSaveAddress(nextValue);
            setValue("saveAddress", nextValue);
          }}
        />
        <span className="text-sm text-[var(--foreground-muted)]">Save this address for future orders.</span>
      </label>
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Place Order (Demo)"}
      </Button>
      <p className="text-xs text-[var(--foreground-subtle)]">
        Payment processing is scaffolded for integration with your live provider.
      </p>
    </form>
  );
}
