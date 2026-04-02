"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  redirectTo?: string;
}

export function SearchInput({
  defaultValue = "",
  placeholder = "Search skincare, makeup, fragrance...",
  className,
  redirectTo = "/search",
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) {
      params.set("q", value.trim());
    }
    router.push(`${redirectTo}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form onSubmit={onSubmit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
      <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="h-11 rounded-full border-[var(--border-strong)] pl-10 pr-4" />
    </form>
  );
}
