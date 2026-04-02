import type { AdminStat } from "@/lib/types/ecommerce";
import { cn } from "@/lib/utils/cn";

export function AdminStatCard({ stat }: { stat: AdminStat }) {
  const positive = stat.change >= 0;
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">{stat.title}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{stat.value}</p>
      <p className="mt-2 text-xs text-[var(--foreground-muted)]">
        <span className={cn("mr-1 font-semibold", positive ? "text-[#1f7b49]" : "text-[#a11f2f]")}>
          {positive ? "+" : ""}
          {stat.change}%
        </span>
        {stat.trend}
      </p>
    </div>
  );
}
