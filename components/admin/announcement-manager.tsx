"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnnouncementRecord {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AnnouncementManager() {
  const [announcement, setAnnouncement] = useState<AnnouncementRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAnnouncement() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/announcement", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          announcement: AnnouncementRecord | null;
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "Unable to load announcement.");
        }

        if (!mounted) return;
        setAnnouncement(payload.announcement);
        setMessage(payload.announcement?.message ?? "");
        setIsActive(payload.announcement?.isActive ?? false);
      } catch (error) {
        if (mounted) {
          toast.error(error instanceof Error ? error.message : "Unable to load announcement.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnnouncement();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) {
      toast.error("Announcement message is required.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: normalizedMessage,
          isActive,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        announcement?: AnnouncementRecord;
      };

      if (!response.ok || !payload.ok || !payload.announcement) {
        throw new Error(payload.error ?? "Unable to save announcement.");
      }

      setAnnouncement(payload.announcement);
      setMessage(payload.announcement.message);
      setIsActive(payload.announcement.isActive);
      toast.success("Announcement updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Announcement</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Loading announcement settings...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Announcement</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Control the global storefront notice shown at the top of every page.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="announcementMessage">Message</Label>
        <Input
          id="announcementMessage"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Enter announcement message..."
          maxLength={280}
        />
        <p className="text-xs text-[var(--foreground-subtle)]">{message.length}/280</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <input
          type="checkbox"
          className="size-4 rounded accent-[var(--brand-900)]"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Announcement active
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--foreground-subtle)]">
          Last updated:{" "}
          {announcement
            ? new Date(announcement.updatedAt).toLocaleString("en-KE", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Not set yet"}
        </p>
        <Button className="rounded-full" onClick={() => void onSave()} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Announcement"}
        </Button>
      </div>
    </section>
  );
}
