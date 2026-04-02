import { FileX2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminTableShellProps {
  title: string;
  description?: string;
  columns: string[];
  rows: string[][];
  primaryActionLabel?: string;
}

export function AdminTableShell({
  title,
  description,
  columns,
  rows,
  primaryActionLabel = "Create",
}: AdminTableShellProps) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
          {description ? <p className="text-sm text-[var(--foreground-muted)]">{description}</p> : null}
        </div>
        <Button size="sm">{primaryActionLabel}</Button>
      </div>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {row.map((value, cellIndex) => (
                  <TableCell key={`${index}-${cellIndex}`}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)] p-8 text-center">
          <FileX2 className="mx-auto mb-3 size-6 text-[var(--foreground-subtle)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">No records yet</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Add your first record to populate this table.</p>
        </div>
      )}
    </section>
  );
}
