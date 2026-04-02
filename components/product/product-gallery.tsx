"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/types/ecommerce";
import { cn } from "@/lib/utils/cn";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images.find((image) => image.isPrimary) ?? images[0]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--brand-50)]">
        <Image src={selectedImage.url} alt={selectedImage.alt || productName} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-2xl border bg-[var(--brand-50)]",
              selectedImage.id === image.id ? "border-[var(--brand-700)]" : "border-[var(--border)]",
            )}
          >
            <Image src={image.url} alt={image.alt} fill sizes="20vw" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
