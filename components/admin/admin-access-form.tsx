"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

import { ADMIN_ACCESS_EMAIL } from "@/lib/constants/admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { normalizeRole } from "@/lib/services/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeInternalNextPath(nextPath: string | null) {
  if (!nextPath) return "/admin";
  if (!nextPath.startsWith("/")) return "/admin";
  if (nextPath.startsWith("//")) return "/admin";
  return nextPath;
}

export function AdminAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => normalizeInternalNextPath(searchParams.get("next")),
    [searchParams],
  );

const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    async function resolveSignedInAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,is_active")
        .eq("id", user.id)
        .maybeSingle();

      const role = normalizeRole(profile?.role ?? user.app_metadata?.role?.toString() ?? null);
      const isActive = profile?.is_active ?? true;
      if (!isActive) {
        toast.error("Your account is deactivated. Contact support.");
        return;
      }

      if (role === "super_admin" || role === "staff_admin") {
        router.replace(nextPath || "/admin");
      }
    }

    void resolveSignedInAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolveSignedInAdmin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [nextPath, router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_ACCESS_EMAIL) {
      toast.error("Only the authorized admin email can request admin access.");
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem("mwangiz_admin_magic_pending", "1");
      localStorage.setItem("mwangiz_admin_magic_next", nextPath || "/admin");

      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/admin/access?next=/admin`;
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Magic login link sent. Check your email inbox.");
    } catch (error) {
      localStorage.removeItem("mwangiz_admin_magic_pending");
      localStorage.removeItem("mwangiz_admin_magic_next");
      toast.error(error instanceof Error ? error.message : "Unable to send login link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Admin Email</Label>
        <Input
          id="adminEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          autoComplete="email"
        />
        <p className="text-xs text-[var(--foreground-muted)]">
          Enter your admin email to receive a secure sign-in link.
        </p>
      </div>
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending link..." : "Send Admin Login Link"}
      </Button>
    </form>
  );
}
