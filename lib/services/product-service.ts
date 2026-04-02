import { products } from "@/lib/data/mock-data";
import type { Product } from "@/lib/types/ecommerce";

export type ProductSort =
  | "featured"
  | "newest"
  | "best-selling"
  | "price-asc"
  | "price-desc"
  | "rating-desc";

export interface ProductQueryOptions {
  search?: string;
  category?: string;
  sort?: ProductSort;
  chip?: string;
}

function bySort(sort: ProductSort) {
  switch (sort) {
    case "newest":
      return (a: Product, b: Product) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    case "best-selling":
      return (a: Product, b: Product) =>
        Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
    case "price-asc":
      return (a: Product, b: Product) => a.price - b.price;
    case "price-desc":
      return (a: Product, b: Product) => b.price - a.price;
    case "rating-desc":
      return (a: Product, b: Product) => b.rating - a.rating;
    case "featured":
    default:
      return (a: Product, b: Product) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
  }
}

export function queryProducts(options: ProductQueryOptions = {}) {
  const { search = "", category, sort = "featured", chip } = options;
  const normalizedSearch = search.toLowerCase().trim();

  const queried = products
    .filter((product) => {
      const categoryMatch = category ? product.categorySlug === category : true;
      const searchMatch = normalizedSearch
        ? [
            product.name,
            product.shortDescription,
            product.description,
            product.categorySlug,
            ...product.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      return categoryMatch && searchMatch;
    })
    .sort(bySort(sort));

  return filterByChip(queried, chip);
}

export function filterByChip(input: Product[], chip?: string) {
  if (!chip) return input;

  switch (chip) {
    case "new":
      return input.filter((product) => product.isNew);
    case "best-seller":
      return input.filter((product) => product.isBestSeller);
    case "under-3000":
      return input.filter((product) => product.price <= 3000);
    case "hydrating":
      return input.filter((product) =>
        product.tags.some((tag) => tag.toLowerCase().includes("hydrating")),
      );
    case "skincare":
      return input.filter((product) => product.categorySlug === "skincare");
    case "makeup":
      return input.filter((product) => product.categorySlug === "makeup");
    default:
      return input;
  }
}
