import {
  bestSellerProducts as mockBestSellerProducts,
  categories as mockCategories,
  featuredProducts as mockFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  getReviewsForProduct,
  newArrivalProducts as mockNewArrivalProducts,
} from "@/lib/data/mock-data";
import { type ProductSort, filterByChip, queryProducts } from "@/lib/services/product-service";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/database.types";
import type { Category, Product, Review } from "@/lib/types/ecommerce";

interface CatalogQueryOptions {
  search?: string;
  category?: string;
  sort?: ProductSort;
  chip?: string;
}

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

type ProductQueryRow = ProductRow & {
  categories: Pick<CategoryRow, "slug"> | null;
  product_images: ProductImageRow[] | null;
};

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

function sortProducts(products: Product[], sort: ProductSort = "featured") {
  const copy = [...products];

  switch (sort) {
    case "newest":
      return copy.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    case "best-selling":
      return copy.sort(
        (a, b) => Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller)),
      );
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating-desc":
      return copy.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return copy.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
  }
}

function mapCategoryRow(
  row: CategoryRow,
  productCountMap: Map<string, number>,
): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image_url,
    featured: row.featured,
    productCount: productCountMap.get(row.id) ?? 0,
  };
}

function mapProductRow(row: ProductQueryRow): Product {
  const images = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isPrimary: image.is_primary,
    }));

  const fallbackProduct = getProductBySlug(row.slug);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    brand: row.brand,
    categorySlug: row.categories?.slug ?? fallbackProduct?.categorySlug ?? "skincare",
    tags: row.tags ?? [],
    images: images.length ? images : fallbackProduct?.images ?? [],
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    currency: row.currency,
    stock: row.stock,
    sku: row.sku,
    rating: row.rating,
    ratingCount: row.rating_count,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    isFeatured: row.is_featured,
    highlights: row.highlights ?? [],
    ingredients: row.ingredients ?? [],
    benefits: row.benefits ?? [],
    howToUse: row.how_to_use ?? [],
  };
}

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userName: row.user_name,
    userAvatar: row.user_avatar ?? undefined,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    verifiedPurchase: row.verified_purchase,
    createdAt: row.created_at,
  };
}

async function fetchCategoriesFromSupabase() {
  const supabase = await getSupabaseServerClient();
  const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id,name,slug,description,image_url,featured,created_at,updated_at")
        .order("name", { ascending: true }),
      supabase.from("products").select("category_id"),
    ]);

  if (categoryError) {
    throw categoryError;
  }

  if (productError) {
    throw productError;
  }

  const productCountMap = new Map<string, number>();
  for (const productRow of productRows ?? []) {
    const nextCount = (productCountMap.get(productRow.category_id) ?? 0) + 1;
    productCountMap.set(productRow.category_id, nextCount);
  }

  return (categoryRows ?? []).map((row) => mapCategoryRow(row, productCountMap));
}

async function fetchProductsFromSupabase(options: CatalogQueryOptions) {
  const supabase = await getSupabaseServerClient();
  const normalizedCategory = options.category ? normalizeSlug(options.category) : undefined;
  let categoryId: string | undefined;

  if (normalizedCategory) {
    const { data: categoryRow, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", normalizedCategory)
      .maybeSingle();

    if (categoryError) {
      throw categoryError;
    }

    if (!categoryRow) {
      return [] as Product[];
    }

    categoryId = categoryRow.id;
  }

  let query = supabase
    .from("products")
    .select(
      "id,slug,name,short_description,description,brand,category_id,tags,price,compare_at_price,currency,stock,sku,rating,rating_count,is_new,is_best_seller,is_featured,highlights,ingredients,benefits,how_to_use,created_at,updated_at,categories:category_id(slug),product_images(id,product_id,url,alt,is_primary,sort_order,created_at)",
    )
    .limit(180);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (options.search?.trim()) {
    const search = options.search.trim().replaceAll(",", " ");
    query = query.or(
      `name.ilike.%${search}%,short_description.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const mappedProducts = (data ?? []).map((row) => mapProductRow(row as ProductQueryRow));
  const filtered = filterByChip(mappedProducts, options.chip);
  return sortProducts(filtered, options.sort);
}

export async function getStoreCategories() {
  if (!hasSupabaseEnv()) {
    return mockCategories;
  }

  try {
    const categories = await fetchCategoriesFromSupabase();
    return categories.length ? categories : mockCategories;
  } catch {
    return mockCategories;
  }
}

export async function getShopProducts(options: CatalogQueryOptions = {}) {
  const fallback = queryProducts(options);

  if (!hasSupabaseEnv()) {
    return fallback;
  }

  try {
    const products = await fetchProductsFromSupabase(options);
    return products.length ? products : fallback;
  } catch {
    return fallback;
  }
}

export async function getHomeCatalogData() {
  const [categories, products] = await Promise.all([getStoreCategories(), getShopProducts()]);

  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 8);
  const bestSellerProducts = products
    .filter((product) => product.isBestSeller)
    .slice(0, 8);
  const newArrivalProducts = products.filter((product) => product.isNew).slice(0, 8);

  return {
    categories,
    featuredProducts: featuredProducts.length ? featuredProducts : mockFeaturedProducts,
    bestSellerProducts: bestSellerProducts.length
      ? bestSellerProducts
      : mockBestSellerProducts,
    newArrivalProducts: newArrivalProducts.length
      ? newArrivalProducts
      : mockNewArrivalProducts,
  };
}

export async function getCategoryPageData(
  slug: string,
  options: Omit<CatalogQueryOptions, "category"> = {},
) {
  const normalizedSlug = normalizeSlug(slug);
  const categories = await getStoreCategories();
  const category = categories.find(
    (item) => item.slug.toLowerCase() === normalizedSlug,
  );

  if (!category) {
    return {
      category: null as Category | null,
      categories,
      products: [] as Product[],
    };
  }

  const products = await getShopProducts({
    ...options,
    category: category.slug,
  });

  return {
    category,
    categories,
    products,
  };
}

export async function getProductPageData(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const fallbackProduct = getProductBySlug(normalizedSlug);

  const fallbackResult = fallbackProduct
    ? {
        product: fallbackProduct,
        relatedProducts: getRelatedProducts(fallbackProduct.id, 4),
        reviews: getReviewsForProduct(fallbackProduct.id),
      }
    : null;

  if (!hasSupabaseEnv()) {
    return fallbackResult;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select(
        "id,slug,name,short_description,description,brand,category_id,tags,price,compare_at_price,currency,stock,sku,rating,rating_count,is_new,is_best_seller,is_featured,highlights,ingredients,benefits,how_to_use,created_at,updated_at,categories:category_id(slug),product_images(id,product_id,url,alt,is_primary,sort_order,created_at)",
      )
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    if (!productRow) {
      return fallbackResult;
    }

    const product = mapProductRow(productRow as ProductQueryRow);
    const [relatedPool, reviewsResponse] = await Promise.all([
      getShopProducts({
        category: product.categorySlug,
        sort: "featured",
      }),
      supabase
        .from("reviews")
        .select(
          "id,product_id,user_id,user_name,user_avatar,rating,title,comment,verified_purchase,created_at,updated_at",
        )
        .eq("product_id", product.id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const relatedProducts = relatedPool
      .filter((item) => item.id !== product.id)
      .slice(0, 4);
    const reviews = (reviewsResponse.data ?? []).map((row) =>
      mapReviewRow(row as ReviewRow),
    );

    return {
      product,
      relatedProducts: relatedProducts.length
        ? relatedProducts
        : fallbackResult?.relatedProducts ?? [],
      reviews: reviews.length ? reviews : fallbackResult?.reviews ?? [],
    };
  } catch {
    return fallbackResult;
  }
}
