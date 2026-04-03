"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MapPinHouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { sampleProfile } from "@/lib/data/mock-data";
import { mapAddressFromForm } from "@/lib/services/address-service";
import { getDeliveryQuote } from "@/lib/services/commerce-selectors";
import {
  getActiveCounties,
  getActiveTownsForCounty,
} from "@/lib/services/service-location-service";
import { useAddressStore } from "@/lib/stores/address-store";
import { useServiceLocationStore } from "@/lib/stores/service-location-store";
import type { Address } from "@/lib/types/ecommerce";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
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
import { cn } from "@/lib/utils/cn";

const DEFAULT_PAYMENT_METHOD: CheckoutFormValues["paymentMethod"] = "mpesa";

export interface CheckoutAddressSubmitPayload {
  address: Address;
  paymentMethod: CheckoutFormValues["paymentMethod"];
  deliveryQuote: ReturnType<typeof getDeliveryQuote>;
}

interface CheckoutAddressFormProps {
  onDeliveryQuoteChange?: (
    quote: ReturnType<typeof getDeliveryQuote>,
  ) => void;
  onSubmitCheckout?: (
    payload: CheckoutAddressSubmitPayload,
  ) => Promise<void> | void;
}

export function CheckoutAddressForm({
  onDeliveryQuoteChange,
  onSubmitCheckout,
}: CheckoutAddressFormProps) {
  const addresses = useAddressStore((state) => state.addresses);
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const hasAddressHydrated = useAddressStore((state) => state.hasHydrated);
  const selectAddress = useAddressStore((state) => state.selectAddress);
  const addAddress = useAddressStore((state) => state.addAddress);

  const counties = useServiceLocationStore((state) => state.counties);
  const towns = useServiceLocationStore((state) => state.towns);
  const hasServiceLocationHydrated = useServiceLocationStore(
    (state) => state.hasHydrated,
  );

  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutFormValues["paymentMethod"]>(DEFAULT_PAYMENT_METHOD);
  const [saveAddress, setSaveAddress] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      selectedAddressId: "",
      fullName: "",
      phone: "",
      countyId: "",
      townCenterId: "",
      streetAddress: "",
      buildingOrHouse: "",
      landmark: "",
      paymentMethod: DEFAULT_PAYMENT_METHOD,
      saveAddress: true,
    },
  });

  const selectedCountyId = useWatch({ control, name: "countyId" }) ?? "";
  const selectedTownCenterId = useWatch({ control, name: "townCenterId" }) ?? "";

  const primaryAddress = useMemo(
    () => addresses.find((address) => address.isPrimary) ?? addresses[0],
    [addresses],
  );

  const selectedSavedAddress = useMemo(() => {
    if (!addresses.length) {
      return undefined;
    }

    return (
      addresses.find((address) => address.id === selectedAddressId) ?? primaryAddress
    );
  }, [addresses, primaryAddress, selectedAddressId]);

  const activeCounties = useMemo(
    () => getActiveCounties(counties, towns),
    [counties, towns],
  );

  const activeTownsForSelectedCounty = useMemo(
    () => getActiveTownsForCounty(towns, selectedCountyId),
    [selectedCountyId, towns],
  );

  const addressMode: "saved" | "new" =
    addresses.length === 0 || showNewAddressForm ? "new" : "saved";

  useEffect(() => {
    if (!hasAddressHydrated) {
      return;
    }

    if (!addresses.length) {
      selectAddress(null);
      return;
    }

    if (!selectedAddressId && primaryAddress) {
      selectAddress(primaryAddress.id);
    }
  }, [addresses, hasAddressHydrated, primaryAddress, selectAddress, selectedAddressId]);

  useEffect(() => {
    if (!selectedSavedAddress || addressMode !== "saved") {
      return;
    }

    setValue("selectedAddressId", selectedSavedAddress.id, { shouldValidate: true });
    setValue("fullName", selectedSavedAddress.fullName, { shouldValidate: true });
    setValue("phone", selectedSavedAddress.phone, { shouldValidate: true });
    setValue("countyId", selectedSavedAddress.countyId, { shouldValidate: true });
    setValue("townCenterId", selectedSavedAddress.townCenterId, {
      shouldValidate: true,
    });
    setValue("streetAddress", selectedSavedAddress.streetAddress, {
      shouldValidate: true,
    });
    setValue("buildingOrHouse", selectedSavedAddress.buildingOrHouse ?? "");
    setValue("landmark", selectedSavedAddress.landmark ?? "");
  }, [addressMode, selectedSavedAddress, setValue]);

  useEffect(() => {
    if (!selectedTownCenterId) {
      return;
    }

    const exists = activeTownsForSelectedCounty.some(
      (town) => town.id === selectedTownCenterId,
    );

    if (!exists) {
      setValue("townCenterId", "", { shouldValidate: true });
    }
  }, [activeTownsForSelectedCounty, selectedTownCenterId, setValue]);

  const deliveryQuote = useMemo(
    () =>
      getDeliveryQuote(counties, towns, selectedCountyId, selectedTownCenterId),
    [counties, selectedCountyId, selectedTownCenterId, towns],
  );

  useEffect(() => {
    onDeliveryQuoteChange?.(deliveryQuote);
  }, [deliveryQuote, onDeliveryQuoteChange]);

  const hasCountySelected = Boolean(selectedCountyId);
  const hasTownSelected = Boolean(selectedTownCenterId);
  const serviceabilityError =
    hasCountySelected && hasTownSelected && !deliveryQuote.isServiceable
      ? "Selected location is currently not serviceable. Choose another county or town."
      : null;

  const onSubmit = async (values: CheckoutFormValues) => {
    if (serviceabilityError || !deliveryQuote.isServiceable) {
      toast.error(
        serviceabilityError ?? "Please select a serviceable county and town.",
      );
      return;
    }

    let finalAddress: Address;

    if (addressMode === "saved" && selectedSavedAddress) {
      finalAddress = selectedSavedAddress;
    } else {
      finalAddress = mapAddressFromForm({
        values: {
          label: undefined,
          fullName: values.fullName,
          phone: values.phone,
          countyId: values.countyId,
          townCenterId: values.townCenterId,
          streetAddress: values.streetAddress,
          buildingOrHouse: values.buildingOrHouse,
          landmark: values.landmark,
          isPrimary: addresses.length === 0,
        },
        userId: sampleProfile.id,
        counties,
        towns,
        forcePrimary: addresses.length === 0,
      });

      if (saveAddress) {
        const result = addAddress(finalAddress);
        if (!result.ok) {
          toast.error(result.message ?? "Unable to save this address.");
        } else {
          selectAddress(finalAddress.id);
          setShowNewAddressForm(false);
        }
      }
    }

    await onSubmitCheckout?.({
      address: finalAddress,
      paymentMethod,
      deliveryQuote,
    });

    if (!onSubmitCheckout) {
      toast.success(
        `Checkout details captured. ETA ${deliveryQuote.etaText}, KES ${deliveryQuote.fee}.`,
      );
    }
  };

  if (!hasAddressHydrated || !hasServiceLocationHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Delivery details</h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Loading saved addresses and service locations...
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Delivery details</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Kenya delivery only. Choose a saved address or enter a new one.
        </p>
      </div>

      {addresses.length ? (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--foreground)]">Saved addresses</p>
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => {
                if (addressMode === "saved") {
                  setShowNewAddressForm(true);
                  setValue("selectedAddressId", "");
                  return;
                }
                setShowNewAddressForm(false);
              }}
            >
              {addressMode === "saved" ? "Use new address" : "Use saved address"}
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {addresses.map((address) => {
              const isSelected = selectedSavedAddress?.id === address.id;
              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => {
                    selectAddress(address.id);
                    setShowNewAddressForm(false);
                  }}
                  className={cn(
                    "rounded-2xl border bg-white p-3 text-left transition",
                    isSelected
                      ? "border-[var(--brand-300)] ring-2 ring-[var(--brand-100)]"
                      : "border-[var(--border)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {address.label ?? "Address"}
                    </p>
                    {isSelected ? (
                      <CheckCircle2 className="size-4 text-[var(--brand-900)]" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                    {address.fullName}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {address.streetAddress}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {address.townCenter}, {address.county}
                  </p>
                  {address.isPrimary ? (
                    <span className="mt-2 inline-flex rounded-full bg-[var(--brand-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-900)]">
                      Primary
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {addressMode === "new" || !addresses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Jane Mwangi" {...register("fullName")} />
            {errors.fullName ? (
              <p className="text-xs text-[#a11f2f]">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+254712345678" {...register("phone")} />
            {errors.phone ? (
              <p className="text-xs text-[#a11f2f]">{errors.phone.message}</p>
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
                    setValue("townCenterId", "", { shouldValidate: true });
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
            <Label>Town / Center / City</Label>
            <Controller
              control={control}
              name="townCenterId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedCountyId || !activeTownsForSelectedCounty.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select town/center" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTownsForSelectedCounty.map((town) => (
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
            <Label htmlFor="buildingOrHouse">Building / House / Apartment (optional)</Label>
            <Input
              id="buildingOrHouse"
              placeholder="House no. / apartment / suite"
              {...register("buildingOrHouse")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark / Delivery Notes (optional)</Label>
            <Input
              id="landmark"
              placeholder="Near landmark, gate color, notes"
              {...register("landmark")}
            />
          </div>
        </div>
      ) : selectedSavedAddress ? (
        <div className="rounded-2xl border border-[var(--brand-200)] bg-[var(--brand-50)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)]">
            <MapPinHouse className="size-4" />
            Delivering to {selectedSavedAddress.townCenter}, {selectedSavedAddress.county}
          </div>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {selectedSavedAddress.fullName} • {selectedSavedAddress.phone}
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">
            {selectedSavedAddress.streetAddress}
          </p>
          {selectedSavedAddress.buildingOrHouse ? (
            <p className="text-sm text-[var(--foreground-muted)]">
              {selectedSavedAddress.buildingOrHouse}
            </p>
          ) : null}
          {selectedSavedAddress.landmark ? (
            <p className="text-sm text-[var(--foreground-muted)]">
              {selectedSavedAddress.landmark}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-3 text-sm">
        <p className="font-medium text-[var(--foreground)]">Delivery quote</p>
        <p className="mt-1 text-[var(--foreground-muted)]">
          {deliveryQuote.isServiceable
            ? `${deliveryQuote.townName}, ${deliveryQuote.countyName} • ${deliveryQuote.etaText} • KES ${deliveryQuote.fee}`
            : "Select a valid county and town to see delivery fee and ETA."}
        </p>
      </div>

      {serviceabilityError ? (
        <p className="rounded-2xl border border-[#f8ccd2] bg-[#fff2f4] p-3 text-sm text-[#8b1c2c]">
          {serviceabilityError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label>Payment method</Label>
        <Select
          value={paymentMethod}
          onValueChange={(value) => {
            const typedValue = value as CheckoutFormValues["paymentMethod"];
            setPaymentMethod(typedValue);
            setValue("paymentMethod", typedValue, { shouldValidate: true });
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

      {addressMode === "new" ? (
        <label className="flex items-start gap-2 rounded-2xl bg-[var(--surface-alt)] p-3">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-[var(--border-strong)] accent-[var(--brand-900)]"
            checked={saveAddress}
            onChange={(event) => {
              const next = event.target.checked;
              setSaveAddress(next);
              setValue("saveAddress", next);
            }}
          />
          <span className="text-sm text-[var(--foreground-muted)]">
            Save this address for future orders (up to 2 saved addresses).
          </span>
        </label>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full rounded-full"
        disabled={isSubmitting || !deliveryQuote.isServiceable}
      >
        {isSubmitting ? "Processing..." : "Confirm Delivery Details"}
      </Button>
    </form>
  );
}
