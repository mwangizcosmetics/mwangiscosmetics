"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MapPinned, PencilLine, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
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
import { mapAddressFromForm } from "@/lib/services/address-service";
import {
  getActiveCounties,
  getActiveTownsForCounty,
} from "@/lib/services/service-location-service";
import { useAddressStore } from "@/lib/stores/address-store";
import { useServiceLocationStore } from "@/lib/stores/service-location-store";
import { cn } from "@/lib/utils/cn";
import { addressSchema, type AddressFormValues } from "@/lib/validators/address";

const EMPTY_VALUES: AddressFormValues = {
  label: "",
  fullName: "",
  email: "",
  phone: "",
  countyId: "",
  townCenterId: "",
  streetAddress: "",
  buildingOrHouse: "",
  landmark: "",
  isPrimary: false,
};

interface AddressBookProps {
  userId: string;
}

export function AddressBook({ userId }: AddressBookProps) {
  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const hasAddressHydrated = useAddressStore((state) => state.hasHydrated);
  const addAddress = useAddressStore((state) => state.addAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const removeAddress = useAddressStore((state) => state.removeAddress);
  const setPrimaryAddress = useAddressStore((state) => state.setPrimaryAddress);
  const selectAddress = useAddressStore((state) => state.selectAddress);

  const counties = useServiceLocationStore((state) => state.counties);
  const towns = useServiceLocationStore((state) => state.towns);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const activeCounties = useMemo(
    () => getActiveCounties(counties, towns),
    [counties, towns],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedCountyId = useWatch({ control, name: "countyId" }) ?? "";
  const selectedTownCenterId = useWatch({ control, name: "townCenterId" }) ?? "";

  const activeTowns = useMemo(
    () => getActiveTownsForCounty(towns, selectedCountyId),
    [selectedCountyId, towns],
  );

  useEffect(() => {
    if (!selectedTownCenterId) {
      return;
    }

    const exists = activeTowns.some((town) => town.id === selectedTownCenterId);
    if (!exists) {
      setValue("townCenterId", "");
    }
  }, [activeTowns, selectedTownCenterId, setValue]);

  const openCreateForm = () => {
    setEditingAddressId(null);
    reset({
      ...EMPTY_VALUES,
      isPrimary: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addressId: string) => {
    const address = addresses.find((item) => item.id === addressId);
    if (!address) {
      return;
    }

    setEditingAddressId(addressId);
    reset({
      label: address.label ?? "",
      fullName: address.fullName,
      email: address.email ?? "",
      phone: address.phone,
      countyId: address.countyId,
      townCenterId: address.townCenterId,
      streetAddress: address.streetAddress,
      buildingOrHouse: address.buildingOrHouse ?? "",
      landmark: address.landmark ?? "",
      isPrimary: address.isPrimary,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: AddressFormValues) => {
    const editingAddress = editingAddressId
      ? addresses.find((address) => address.id === editingAddressId)
      : undefined;

    const nextAddress = mapAddressFromForm({
      values,
      userId,
      counties,
      towns,
      existingAddress: editingAddress,
      forcePrimary: addresses.length === 0,
    });

    if (editingAddressId) {
      const result = updateAddress(editingAddressId, nextAddress);
      if (!result.ok) {
        toast.error(result.message ?? "Failed to update address.");
        return;
      }
      toast.success("Address updated.");
      setIsFormOpen(false);
      return;
    }

    const result = addAddress(nextAddress);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to save address.");
      return;
    }

    toast.success("Address added.");
    setIsFormOpen(false);
  };

  if (!hasAddressHydrated) {
    return (
      <section
        id="addresses"
        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Saved addresses</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Loading your delivery presets...
        </p>
      </section>
    );
  }

  return (
    <section
      id="addresses"
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPinned className="size-4 text-[var(--brand-700)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Saved addresses</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Save up to 2 addresses. Choose one as primary for faster checkout.
          </p>
        </div>
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="rounded-full"
              onClick={openCreateForm}
              disabled={addresses.length >= 2}
            >
              <Plus className="size-4" />
              Add Address
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingAddressId ? "Edit delivery address" : "Add delivery address"}
              </SheetTitle>
              <SheetDescription>
                Use serviceable Kenya locations only. One address can be marked as primary.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-4 pb-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (optional)</Label>
                  <Input id="label" placeholder="Home / Work" {...register("label")} />
                  {errors.label ? (
                    <p className="text-xs text-[#a11f2f]">{errors.label.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Jane Mwangi" {...register("fullName")} />
                  {errors.fullName ? (
                    <p className="text-xs text-[#a11f2f]">{errors.fullName.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+254712345678"
                    {...register("phone")}
                  />
                  {errors.phone ? (
                    <p className="text-xs text-[#a11f2f]">{errors.phone.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-xs text-[#a11f2f]">{errors.email.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Controller
                    control={control}
                    name="countyId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("townCenterId", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCounties.map((county) => (
                            <SelectItem key={county.id} value={county.id}>
                              {county.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.countyId ? (
                    <p className="text-xs text-[#a11f2f]">{errors.countyId.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Town / Center</Label>
                  <Controller
                    control={control}
                    name="townCenterId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select town/center" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeTowns.map((town) => (
                            <SelectItem key={town.id} value={town.id}>
                              {town.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.townCenterId ? (
                    <p className="text-xs text-[#a11f2f]">{errors.townCenterId.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    placeholder="Street / estate / route"
                    {...register("streetAddress")}
                  />
                  {errors.streetAddress ? (
                    <p className="text-xs text-[#a11f2f]">{errors.streetAddress.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingOrHouse">Building / House (optional)</Label>
                  <Input
                    id="buildingOrHouse"
                    placeholder="Apartment, suite, house no."
                    {...register("buildingOrHouse")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (optional)</Label>
                  <Input
                    id="landmark"
                    placeholder="Near major landmark"
                    {...register("landmark")}
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 rounded-2xl bg-[var(--surface-alt)] p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-[var(--border-strong)] accent-[var(--brand-900)]"
                  {...register("isPrimary")}
                />
                <span className="text-sm text-[var(--foreground-muted)]">
                  Set as primary delivery address
                </span>
              </label>

              <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {!addresses.length ? (
        <EmptyState
          icon={MapPinned}
          title="No saved addresses yet"
          description="Save a delivery address to speed up checkout."
          className="p-6"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <article
                key={address.id}
                className={cn(
                  "rounded-2xl border bg-white p-4 text-sm shadow-sm transition",
                  isSelected
                    ? "border-[var(--brand-300)] ring-2 ring-[var(--brand-100)]"
                    : "border-[var(--border)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--foreground)]">
                      {address.label ?? "Address"}
                    </p>
                    {address.isPrimary ? (
                      <span className="rounded-full bg-[var(--brand-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-900)]">
                        Primary
                      </span>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="size-4 text-[var(--brand-800)]" />
                  ) : null}
                </div>
                <p className="mt-2 font-medium text-[var(--foreground)]">{address.fullName}</p>
                <p className="mt-1 text-[var(--foreground-muted)]">{address.phone}</p>
                {address.email ? (
                  <p className="mt-1 text-[var(--foreground-muted)]">{address.email}</p>
                ) : null}
                <p className="mt-1 text-[var(--foreground-muted)]">{address.streetAddress}</p>
                {address.buildingOrHouse ? (
                  <p className="text-[var(--foreground-muted)]">{address.buildingOrHouse}</p>
                ) : null}
                {address.landmark ? (
                  <p className="text-[var(--foreground-muted)]">{address.landmark}</p>
                ) : null}
                <p className="mt-1 text-[var(--foreground-muted)]">
                  {address.townCenter}, {address.county}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full"
                    onClick={() => selectAddress(address.id)}
                  >
                    Use in checkout
                  </Button>
                  {!address.isPrimary ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-full"
                      onClick={() => {
                        setPrimaryAddress(address.id);
                        toast.success("Primary address updated.");
                      }}
                    >
                      <Star className="size-3.5" />
                      Set Primary
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full"
                    onClick={() => openEditForm(address.id)}
                  >
                    <PencilLine className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                    onClick={() => {
                      removeAddress(address.id);
                      toast.success("Address removed.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

