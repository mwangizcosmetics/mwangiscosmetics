"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import {
  adminCouponSchema,
  type AdminCouponValues,
} from "@/lib/validators/admin";

type AdminCouponFormInput = z.input<typeof adminCouponSchema>;

const defaultValues: AdminCouponValues = {
  code: "",
  description: "",
  type: "percentage",
  value: 10,
  minSubtotal: undefined,
  usageLimit: undefined,
  expiresAt: "",
  active: true,
};

export function CouponsManager() {
  const coupons = useCommerceStore((state) => state.coupons);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const createCoupon = useCommerceStore((state) => state.createCoupon);
  const updateCoupon = useCommerceStore((state) => state.updateCoupon);
  const toggleCouponActive = useCommerceStore((state) => state.toggleCouponActive);
  const deleteCoupon = useCommerceStore((state) => state.deleteCoupon);

  const [searchValue, setSearchValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminCouponFormInput, unknown, AdminCouponValues>({
    resolver: zodResolver(adminCouponSchema),
    defaultValues,
  });
  const couponType = useWatch({ control, name: "type" });

  const filteredCoupons = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return coupons.filter((coupon) => {
      if (!query) return true;
      return coupon.code.toLowerCase().includes(query);
    });
  }, [coupons, searchValue]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultValues);
    setIsSheetOpen(true);
  };

  const openEdit = (couponId: string) => {
    const coupon = coupons.find((item) => item.id === couponId);
    if (!coupon) return;

    setEditingId(couponId);
    reset({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minSubtotal: coupon.minSubtotal,
      usageLimit: coupon.usageLimit,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      active: coupon.active,
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (values: AdminCouponValues) => {
    const payload = {
      ...values,
      expiresAt: values.expiresAt || undefined,
    };

    if (editingId) {
      const result = updateCoupon(editingId, payload);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to update coupon.");
        return;
      }
      toast.success("Coupon updated.");
      setIsSheetOpen(false);
      return;
    }

    const result = createCoupon(payload);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to create coupon.");
      return;
    }
    toast.success("Coupon created.");
    setIsSheetOpen(false);
  };

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Coupons</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading coupon data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Coupons</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Create and control discount campaigns used at checkout.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-full" onClick={openCreate}>
              <Plus className="size-4" />
              Create Coupon
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingId ? "Edit coupon" : "Create coupon"}</SheetTitle>
              <SheetDescription>
                Configure active discount rules used in checkout validation.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 pb-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="couponCode">Code</Label>
                <Input id="couponCode" placeholder="GLOW10" {...register("code")} />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={couponType} onValueChange={(value) => setValue("type", value as "percentage" | "fixed")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="couponDescription">Description</Label>
                <Input id="couponDescription" placeholder="Optional campaign note" {...register("description")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponValue">Discount Value</Label>
                <Input id="couponValue" type="number" min={0} {...register("value")} />
                {errors.value ? <p className="text-xs text-[#a11f2f]">{errors.value.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponMinOrder">Minimum Order (optional)</Label>
                <Input id="couponMinOrder" type="number" min={0} {...register("minSubtotal")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponUsageLimit">Usage Limit (optional)</Label>
                <Input id="couponUsageLimit" type="number" min={1} {...register("usageLimit")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponExpiry">Expires At (optional)</Label>
                <Input id="couponExpiry" type="date" {...register("expiresAt")} />
              </div>
              {editingId ? (
                <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <input type="checkbox" className="size-4 rounded accent-[var(--brand-900)]" {...register("active")} />
                  Coupon active
                </label>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search coupon by code..."
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredCoupons.map((coupon) => (
          <article
            key={coupon.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{coupon.code}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {coupon.type === "fixed" ? `KES ${coupon.value}` : `${coupon.value}%`} - {coupon.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => openEdit(coupon.id)}>
                <Edit3 className="size-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  toggleCouponActive(coupon.id);
                  toast.success(coupon.active ? "Coupon deactivated." : "Coupon activated.");
                }}
              >
                {coupon.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                onClick={() => {
                  deleteCoupon(coupon.id);
                  toast.success("Coupon removed.");
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

