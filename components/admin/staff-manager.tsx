"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldPlus, UserRound, UserX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StaffRole = "super_admin" | "staff_admin" | "beba";

interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffResponse {
  ok: boolean;
  staff?: StaffUser[];
  error?: string;
}

const defaultCreateState = {
  email: "",
  password: "",
  fullName: "",
  phone: "",
  role: "staff_admin" as StaffRole,
};

export function StaffManager() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [createDraft, setCreateDraft] = useState(defaultCreateState);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const fetchStaff = useCallback(async (options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    try {
      const response = await fetch("/api/admin/staff", { cache: "no-store" });
      const payload = (await response.json()) as StaffResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to load staff records.");
      }
      setStaff(payload.staff ?? []);
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "Unable to load staff.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStaff({ silent: true });
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return staff;
    }
    return staff.filter((entry) =>
      [entry.fullName, entry.email, entry.role].join(" ").toLowerCase().includes(query),
    );
  }, [search, staff]);

  const createStaff = async () => {
    if (!createDraft.email || !createDraft.password || !createDraft.fullName) {
      toast.error("Full name, email and password are required.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createDraft),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? "Unable to create staff account.");
        return;
      }

      toast.success("Staff account created.");
      setCreateDraft(defaultCreateState);
      await fetchStaff({ silent: true });
    } catch {
      toast.error("Unable to create staff account.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateStaff = async (userId: string, payload: Record<string, unknown>) => {
    setActionUserId(userId);
    try {
      const response = await fetch(`/api/admin/staff/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !result.ok) {
        toast.error(result.error ?? "Unable to update staff account.");
        return;
      }
      toast.success("Staff account updated.");
      await fetchStaff({ silent: true });
    } catch {
      toast.error("Unable to update staff account.");
    } finally {
      setActionUserId(null);
    }
  };

  const deactivateStaff = async (userId: string) => {
    setActionUserId(userId);
    try {
      const response = await fetch(`/api/admin/staff/${userId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        toast.error(payload.error ?? "Unable to deactivate staff.");
        return;
      }
      toast.success("Staff account deactivated.");
      await fetchStaff({ silent: true });
    } catch {
      toast.error("Unable to deactivate staff.");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <section className="space-y-4">
      <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <ShieldPlus className="size-4 text-[var(--brand-700)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Staff Management</h2>
        </div>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Create and manage STAFF_ADMIN and BEBA accounts with role and activation control.
        </p>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          <Input
            value={createDraft.fullName}
            onChange={(event) =>
              setCreateDraft((state) => ({ ...state, fullName: event.target.value }))
            }
            placeholder="Full name"
            className="h-10 rounded-xl"
          />
          <Input
            value={createDraft.email}
            onChange={(event) =>
              setCreateDraft((state) => ({ ...state, email: event.target.value }))
            }
            placeholder="Email"
            className="h-10 rounded-xl"
          />
          <Input
            value={createDraft.password}
            onChange={(event) =>
              setCreateDraft((state) => ({ ...state, password: event.target.value }))
            }
            placeholder="Temporary password"
            className="h-10 rounded-xl"
          />
          <Input
            value={createDraft.phone}
            onChange={(event) =>
              setCreateDraft((state) => ({ ...state, phone: event.target.value }))
            }
            placeholder="Phone"
            className="h-10 rounded-xl"
          />
          <Select
            value={createDraft.role}
            onValueChange={(value) =>
              setCreateDraft((state) => ({ ...state, role: value as StaffRole }))
            }
          >
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff_admin">STAFF_ADMIN</SelectItem>
              <SelectItem value="beba">BEBA</SelectItem>
              <SelectItem value="super_admin">SUPER_ADMIN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="mt-3 h-10 rounded-xl" onClick={() => void createStaff()} disabled={isSaving}>
          {isSaving ? "Creating..." : "Create Staff Account"}
        </Button>
      </article>

      <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[var(--foreground)]">Staff Directory</h3>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search staff..."
            className="h-9 max-w-xs rounded-xl"
          />
        </div>

        {isLoading ? (
          <p className="mt-3 text-sm text-[var(--foreground-muted)]">Loading staff records...</p>
        ) : filteredStaff.length ? (
          <div className="mt-3 space-y-2">
            {filteredStaff.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {entry.fullName || "Unnamed"}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">{entry.email}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {entry.phone || "No phone"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={entry.isActive ? "success" : "outline"}>
                      {entry.isActive ? "active" : "inactive"}
                    </Badge>
                    <Badge variant="soft">{entry.role}</Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select
                    value={entry.role}
                    onValueChange={(value) =>
                      void updateStaff(entry.id, { role: value as StaffRole })
                    }
                  >
                    <SelectTrigger className="h-9 w-44 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">SUPER_ADMIN</SelectItem>
                      <SelectItem value="staff_admin">STAFF_ADMIN</SelectItem>
                      <SelectItem value="beba">BEBA</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl"
                    disabled={actionUserId === entry.id}
                    onClick={() => void updateStaff(entry.id, { isActive: !entry.isActive })}
                  >
                    <UserRound className="size-4" />
                    {entry.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl"
                    disabled={actionUserId === entry.id}
                    onClick={() => void deactivateStaff(entry.id)}
                  >
                    <UserX className="size-4" />
                    Disable
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] p-5 text-sm text-[var(--foreground-muted)]">
            No staff account records found.
          </div>
        )}
      </article>
    </section>
  );
}
