import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand-900)] text-white shadow-sm hover:bg-[var(--brand-800)] active:scale-[0.99]",
        soft: "bg-[var(--brand-100)] text-[var(--brand-900)] hover:bg-[var(--brand-200)]",
        outline:
          "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:bg-[var(--brand-50)]",
        ghost: "text-[var(--foreground-muted)] hover:bg-[var(--brand-100)] hover:text-[var(--foreground)]",
        destructive:
          "bg-[#a11f2f] text-white shadow-sm hover:bg-[#881928]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 px-6 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
