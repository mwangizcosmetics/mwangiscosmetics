import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/lib/types/ecommerce";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/category/${category.slug}`} className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
      </div>
      <div className="space-y-1 p-4">
        <h3 className="text-base font-semibold text-[var(--foreground)]">{category.name}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">{category.productCount} products</p>
      </div>
    </Link>
  );
}
