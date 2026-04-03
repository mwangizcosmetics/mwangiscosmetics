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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { slugify } from "@/lib/utils/format";
import {
  adminCategorySchema,
  type AdminCategoryValues,
} from "@/lib/validators/admin";

type AdminCategoryFormInput = z.input<typeof adminCategorySchema>;

const defaultValues: AdminCategoryValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
};

export function CategoriesManager() {
  const categories = useCommerceStore((state) => state.categories);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const createCategory = useCommerceStore((state) => state.createCategory);
  const updateCategory = useCommerceStore((state) => state.updateCategory);
  const toggleCategoryActive = useCommerceStore((state) => state.toggleCategoryActive);
  const deleteCategory = useCommerceStore((state) => state.deleteCategory);

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
  } = useForm<AdminCategoryFormInput, unknown, AdminCategoryValues>({
    resolver: zodResolver(adminCategorySchema),
    defaultValues,
  });

  const nameValue = useWatch({ control, name: "name" });
  const slugValue = useWatch({ control, name: "slug" });

  const filteredCategories = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return categories
      .filter((category) => {
        if (!query) return true;
        return (
          category.name.toLowerCase().includes(query) ||
          category.slug.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchValue]);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultValues);
    setIsSheetOpen(true);
  };

  const openEdit = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;

    setEditingId(categoryId);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive !== false,
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (values: AdminCategoryValues) => {
    if (editingId) {
      const result = updateCategory(editingId, {
        ...values,
        slug: values.slug || slugify(values.name),
      });
      if (!result.ok) {
        toast.error(result.message ?? "Unable to update category.");
        return;
      }
      toast.success("Category updated.");
      setIsSheetOpen(false);
      return;
    }

    const result = createCategory({
      ...values,
      slug: values.slug || slugify(values.name),
    });
    if (!result.ok) {
      toast.error(result.message ?? "Unable to create category.");
      return;
    }
    toast.success("Category created.");
    setIsSheetOpen(false);
  };

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Categories</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading category data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Categories</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Add, edit, and control storefront category visibility.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreate} className="rounded-full">
              <Plus className="size-4" />
              Add Category
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingId ? "Edit category" : "Create category"}</SheetTitle>
              <SheetDescription>
                Keep category naming clean for better storefront browsing.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Name</Label>
                <Input id="categoryName" placeholder="Skincare" {...register("name")} />
                {errors.name ? (
                  <p className="text-xs text-[#a11f2f]">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorySlug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="categorySlug"
                    placeholder="auto-generated if blank"
                    {...register("slug")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setValue("slug", slugify(nameValue || ""))}
                    className="rounded-xl"
                  >
                    Auto
                  </Button>
                </div>
                {errors.slug ? (
                  <p className="text-xs text-[#a11f2f]">{errors.slug.message}</p>
                ) : null}
                {slugValue ? (
                  <p className="text-xs text-[var(--foreground-subtle)]">Preview: /category/{slugValue}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Input
                  id="categoryDescription"
                  placeholder="Optional short category description"
                  {...register("description")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryImage">Image URL</Label>
                <Input
                  id="categoryImage"
                  placeholder="https://..."
                  {...register("image")}
                />
                {errors.image ? (
                  <p className="text-xs text-[#a11f2f]">{errors.image.message}</p>
                ) : null}
              </div>
              {editingId ? (
                <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <input
                    type="checkbox"
                    className="size-4 rounded accent-[var(--brand-900)]"
                    {...register("isActive")}
                  />
                  Category active
                </label>
              ) : null}
              <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Update Category" : "Create Category"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search categories..."
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredCategories.map((category) => (
          <article
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{category.name}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                /{category.slug} - {category.isActive === false ? "Inactive" : "Active"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={() => openEdit(category.id)}
              >
                <Edit3 className="size-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  toggleCategoryActive(category.id);
                  toast.success(
                    category.isActive === false
                      ? "Category activated."
                      : "Category deactivated.",
                  );
                }}
              >
                {category.isActive === false ? "Activate" : "Deactivate"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                onClick={() => {
                  deleteCategory(category.id);
                  toast.success("Category removed.");
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

