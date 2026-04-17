"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { normalizeRole } from "@/lib/services/rbac";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const PENDING_KEY = "mwangiz_admin_magic_pending";
const NEXT_KEY = "mwangiz_admin_magic_next";

function clearPendingFlags() {
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(NEXT_KEY);
}

function normalizeInternalNextPath(nextPath: string | null) {
  if (!nextPath) return "/admin";
  if (!nextPath.startsWith("/")) return "/admin";
  if (nextPath.startsWith("//")) return "/admin";
  if (!nextPath.startsWith("/admin")) return "/admin";
  return nextPath;
}

export function AdminMagicPendingRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      return;
    }

    const pending = localStorage.getItem(PENDING_KEY);
    if (!pending) {
      return;
    }

    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    async function resolvePendingAdminFlow() {
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
        clearPendingFlags();
        return;
      }

      if (role === "super_admin" || role === "staff_admin") {
        const nextPath = normalizeInternalNextPath(localStorage.getItem(NEXT_KEY));
        clearPendingFlags();
        router.replace(nextPath);
        return;
      }

      clearPendingFlags();
    }

    void resolvePendingAdminFlow();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolvePendingAdminFlow();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
