"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-[var(--border)] group-[.toaster]:bg-white group-[.toaster]:text-[var(--foreground)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--foreground-muted)]",
          actionButton: "group-[.toast]:bg-[var(--brand-900)] group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
