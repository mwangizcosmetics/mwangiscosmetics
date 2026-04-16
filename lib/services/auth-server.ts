import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  hasPermission,
  normalizeRole,
  type NormalizedRole,
  type PlatformPermission,
} from "@/lib/services/rbac";

interface AuthenticatedProfile {
  id: string;
  role: NormalizedRole;
  isActive: boolean;
}

export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function getAuthenticatedProfile(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return {
      profile: {
        id: userId,
        role: "customer" as NormalizedRole,
        isActive: true,
      },
    };
  }

  return {
    profile: {
      id: profile.id,
      role: normalizeRole(profile.role),
      isActive: profile.is_active ?? true,
    } satisfies AuthenticatedProfile,
  };
}

export async function requireAuthenticatedUser() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return {
      ok: false as const,
      status: 401,
      message: "Authentication required.",
      supabase,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  const normalizedRole = normalizeRole(profile?.role);
  const isActive = profile?.is_active ?? true;
  if (!isActive) {
    return {
      ok: false as const,
      status: 403,
      message: "Your account is deactivated. Contact support.",
      supabase,
      user,
      profile: null,
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
    profile: {
      id: profile?.id ?? user.id,
      role: normalizedRole,
      isActive,
    } satisfies AuthenticatedProfile,
  };
}

export async function requirePermission(permission: PlatformPermission) {
  const authResult = await requireAuthenticatedUser();
  if (!authResult.ok) {
    return authResult;
  }

  if (!hasPermission(authResult.profile.role, permission)) {
    return {
      ok: false as const,
      status: 403,
      message: "You do not have permission for this action.",
      supabase: authResult.supabase,
      user: authResult.user,
      profile: authResult.profile,
    };
  }

  return authResult;
}

export async function requireAdminUser() {
  return requirePermission("admin:access");
}

export async function requireSuperAdminUser() {
  return requirePermission("admin:staff_management");
}

export async function requireBebaUser() {
  return requirePermission("beba:access");
}
