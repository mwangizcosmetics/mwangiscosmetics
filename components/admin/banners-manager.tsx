"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { adminBannerSchema, type AdminBannerValues } from "@/lib/validators/admin";

type AdminBannerFormInput = z.input<typeof adminBannerSchema>;

const defaultValues: AdminBannerValues = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  href: "",
  badge: "",
  position: 1,
  active: true,
};

export function BannersManager() {
  const banners = useCommerceStore((state) => state.banners);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const createBanner = useCommerceStore((state) => state.createBanner);
  const updateBanner = useCommerceStore((state) => state.updateBanner);
  const toggleBannerActive = useCommerceStore((state) => state.toggleBannerActive);
  const deleteBanner = useCommerceStore((state) => state.deleteBanner);
  const reorderBanner = useCommerceStore((state) => state.reorderBanner);

  const [searchValue, setSearchValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminBannerFormInput, unknown, AdminBannerValues>({
    resolver: zodResolver(adminBannerSchema),
    defaultValues,
  });

  const sortedBanners = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return [...banners]
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
      .filter((banner) =>
        query ? banner.title.toLowerCase().includes(query) : true,
      );
  }, [banners, searchValue]);

  const openCreate = () => {
    setEditingId(null);
    reset({
      ...defaultValues,
      position: sortedBanners.length + 1,
    });
    setIsSheetOpen(true);
  };

  const openEdit = (bannerId: string) => {
    const banner = banners.find((item) => item.id === bannerId);
    if (!banner) return;

    setEditingId(bannerId);
    reset({
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      imageUrl: banner.imageUrl,
      ctaLabel: banner.ctaLabel ?? "",
      href: banner.href ?? "",
      badge: banner.badge ?? "",
      position: banner.position ?? 1,
      active: banner.active,
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (values: AdminBannerValues) => {
    if (editingId) {
      const result = updateBanner(editingId, values);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to update banner.");
        return;
      }
      toast.success("Banner updated.");
      setIsSheetOpen(false);
      return;
    }

    const result = createBanner(values);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to create banner.");
      return;
    }
    toast.success("Banner created.");
    setIsSheetOpen(false);
  };

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Banners</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading banner data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Banners</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Manage homepage campaigns, status, and display ordering.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-full" onClick={openCreate}>
              <Plus className="size-4" />
              Create Banner
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingId ? "Edit banner" : "Create banner"}</SheetTitle>
              <SheetDescription>
                Only active banners are shown on the homepage, ordered by position.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 pb-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bannerTitle">Title</Label>
                <Input id="bannerTitle" placeholder="Campaign title" {...register("title")} />
                {errors.title ? <p className="text-xs text-[#a11f2f]">{errors.title.message}</p> : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bannerSubtitle">Subtitle</Label>
                <Input id="bannerSubtitle" placeholder="Optional subtitle" {...register("subtitle")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bannerImage">Image URL</Label>
                <Input id="bannerImage" placeholder="https://..." {...register("imageUrl")} />
                {errors.imageUrl ? <p className="text-xs text-[#a11f2f]">{errors.imageUrl.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerCtaLabel">CTA Label</Label>
                <Input id="bannerCtaLabel" placeholder="Shop now" {...register("ctaLabel")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerHref">CTA Link</Label>
                <Input id="bannerHref" placeholder="/shop" {...register("href")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerBadge">Badge</Label>
                <Input id="bannerBadge" placeholder="Limited Offer" {...register("badge")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerPosition">Position</Label>
                <Input
                  id="bannerPosition"
                  type="number"
                  min={1}
                  {...register("position", { valueAsNumber: true })}
                />
              </div>
              {editingId ? (
                <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <input type="checkbox" className="size-4 rounded accent-[var(--brand-900)]" {...register("active")} />
                  Banner active
                </label>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
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
          placeholder="Search banners..."
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="space-y-2">
        {sortedBanners.map((banner, index) => (
          <article
            key={banner.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{banner.title}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                Position {banner.position ?? index + 1} - {banner.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => openEdit(banner.id)}>
                <Edit3 className="size-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  reorderBanner(banner.id, Math.max((banner.position ?? 1) - 1, 1));
                  toast.success("Banner moved up.");
                }}
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  reorderBanner(banner.id, (banner.position ?? index + 1) + 1);
                  toast.success("Banner moved down.");
                }}
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  toggleBannerActive(banner.id);
                  toast.success(banner.active ? "Banner deactivated." : "Banner activated.");
                }}
              >
                {banner.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                onClick={() => {
                  deleteBanner(banner.id);
                  toast.success("Banner removed.");
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

