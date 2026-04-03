"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Search, Star, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCommerceStore } from "@/lib/stores/commerce-store";
import { formatCurrency, slugify } from "@/lib/utils/format";
import {
  adminProductSchema,
  type AdminProductValues,
} from "@/lib/validators/admin";

type AdminProductFormInput = z.input<typeof adminProductSchema>;

const defaultValues: AdminProductValues = {
  name: "",
  slug: "",
  categorySlug: "",
  shortDescription: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  sku: "",
  brand: "MWANGIZ Cosmetics",
  imageUrls: "",
  isFeatured: false,
  isActive: true,
};

function parseImageUrls(value: string) {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function ProductsManager() {
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const hasHydrated = useCommerceStore((state) => state.hasHydrated);
  const createProduct = useCommerceStore((state) => state.createProduct);
  const updateProduct = useCommerceStore((state) => state.updateProduct);
  const toggleProductActive = useCommerceStore((state) => state.toggleProductActive);
  const toggleProductFeatured = useCommerceStore((state) => state.toggleProductFeatured);
  const deleteProduct = useCommerceStore((state) => state.deleteProduct);

  const [searchValue, setSearchValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return products
      .filter((product) => {
        if (!query) return true;
        return (
          product.name.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.name.localeCompare(a.name));
  }, [products, searchValue]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductFormInput, unknown, AdminProductValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues,
  });

  const nameValue = useWatch({ control, name: "name" });
  const categoryValue = useWatch({ control, name: "categorySlug" });

  const openCreate = () => {
    setEditingId(null);
    reset(defaultValues);
    setIsSheetOpen(true);
  };

  const openEdit = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setEditingId(productId);
    reset({
      name: product.name,
      slug: product.slug,
      categorySlug: product.categorySlug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      sku: product.sku,
      brand: product.brand,
      imageUrls: product.images.map((image) => image.url).join("\n"),
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (values: AdminProductValues) => {
    const imageUrls = parseImageUrls(values.imageUrls);
    if (!imageUrls.length) {
      toast.error("Add at least one image URL.");
      return;
    }

    const payload = {
      ...values,
      slug: values.slug || slugify(values.name),
      imageUrls,
    };

    if (editingId) {
      const result = updateProduct(editingId, payload);
      if (!result.ok) {
        toast.error(result.message ?? "Unable to update product.");
        return;
      }
      toast.success("Product updated.");
      setIsSheetOpen(false);
      return;
    }

    const result = createProduct(payload);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to create product.");
      return;
    }

    toast.success("Product created.");
    setIsSheetOpen(false);
  };

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Products</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading product data...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Products</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Manage active catalog products, pricing, stock, and featured highlights.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-full" onClick={openCreate}>
              <Plus className="size-4" />
              Add Product
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingId ? "Edit product" : "Create product"}</SheetTitle>
              <SheetDescription>
                Keep core product details complete for storefront conversion.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 pb-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productName">Name</Label>
                <Input id="productName" placeholder="Product name" {...register("name")} />
                {errors.name ? <p className="text-xs text-[#a11f2f]">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="productSlug">Slug</Label>
                <div className="flex gap-2">
                  <Input id="productSlug" placeholder="auto-generated if blank" {...register("slug")} />
                  <Button type="button" variant="outline" onClick={() => setValue("slug", slugify(nameValue || ""))}>
                    Auto
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryValue}
                  onValueChange={(value) => setValue("categorySlug", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categorySlug ? (
                  <p className="text-xs text-[#a11f2f]">{errors.categorySlug.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productShortDescription">Short Description</Label>
                <Input
                  id="productShortDescription"
                  placeholder="Short benefit-oriented summary"
                  {...register("shortDescription")}
                />
                {errors.shortDescription ? (
                  <p className="text-xs text-[#a11f2f]">{errors.shortDescription.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productDescription">Full Description</Label>
                <Textarea
                  id="productDescription"
                  rows={4}
                  placeholder="Detailed product description"
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-xs text-[#a11f2f]">{errors.description.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPrice">Price (KES)</Label>
                <Input id="productPrice" type="number" min={0} {...register("price")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productComparePrice">Compare At Price (optional)</Label>
                <Input id="productComparePrice" type="number" min={0} {...register("compareAtPrice")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productStock">Stock Quantity</Label>
                <Input id="productStock" type="number" min={0} {...register("stock")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productSku">SKU (optional)</Label>
                <Input id="productSku" placeholder="SKU" {...register("sku")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productBrand">Brand</Label>
                <Input id="productBrand" {...register("brand")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productImageUrls">Image URLs</Label>
                <Textarea
                  id="productImageUrls"
                  rows={3}
                  placeholder="One URL per line or comma-separated"
                  {...register("imageUrls")}
                />
                {errors.imageUrls ? (
                  <p className="text-xs text-[#a11f2f]">{errors.imageUrls.message}</p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <input type="checkbox" className="size-4 rounded accent-[var(--brand-900)]" {...register("isFeatured")} />
                Featured product
              </label>
              {editingId ? (
                <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <input type="checkbox" className="size-4 rounded accent-[var(--brand-900)]" {...register("isActive")} />
                  Product active
                </label>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingId ? "Update Product" : "Create Product"}
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
          placeholder="Search products by name, slug, or SKU..."
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{product.name}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {formatCurrency(product.price)} - Stock {product.stock} - {product.isActive === false ? "Inactive" : "Active"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => openEdit(product.id)}>
                <Edit3 className="size-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  toggleProductFeatured(product.id);
                  toast.success(
                    product.isFeatured ? "Removed from featured." : "Marked as featured.",
                  );
                }}
              >
                <Star className="size-3.5" />
                {product.isFeatured ? "Unfeature" : "Feature"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                onClick={() => {
                  toggleProductActive(product.id);
                  toast.success(product.isActive === false ? "Product activated." : "Product deactivated.");
                }}
              >
                {product.isActive === false ? "Activate" : "Deactivate"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                onClick={() => {
                  deleteProduct(product.id);
                  toast.success("Product removed.");
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

