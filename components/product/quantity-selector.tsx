"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-white p-1">
      <button
        type="button"
        onClick={decrease}
        className="inline-flex size-8 items-center justify-center rounded-full text-[var(--foreground-muted)] transition hover:bg-[var(--brand-100)] hover:text-[var(--foreground)]"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-9 text-center text-sm font-semibold text-[var(--foreground)]">{value}</span>
      <button
        type="button"
        onClick={increase}
        className="inline-flex size-8 items-center justify-center rounded-full text-[var(--foreground-muted)] transition hover:bg-[var(--brand-100)] hover:text-[var(--foreground)]"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
