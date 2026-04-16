import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import {
  getRoleDefaultPath,
  hasPermission,
  normalizeRole,
} from "@/lib/services/rbac";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function getLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/login";
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.searchParams.set("next", nextPath);
  return redirectUrl;
}

function getDeniedRedirect(request: NextRequest, fallbackPath: string) {
  const deniedUrl = request.nextUrl.clone();
  deniedUrl.pathname = fallbackPath;
  deniedUrl.searchParams.set("denied", "role");
  return deniedUrl;
}

const superAdminOnlyAdminPaths = [
  "/admin/payment-logs",
  "/admin/pending-payments",
  "/admin/coupons",
  "/admin/discounts",
  "/admin/customers",
  "/admin/staff",
];

function requiresSuperAdmin(pathname: string) {
  return superAdminOnlyAdminPaths.some((path) => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresAuth =
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/checkout");
  const requiresAdmin = pathname.startsWith("/admin");
  const requiresBeba = pathname.startsWith("/beba");

  if (!requiresAuth && !requiresAdmin && !requiresBeba) {
    return NextResponse.next();
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
          }

          response = NextResponse.next({
            request,
          });

          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (requiresAuth || requiresAdmin || requiresBeba)) {
    return NextResponse.redirect(getLoginRedirect(request));
  }

  if (!user) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  const role = normalizeRole(profile?.role ?? user.app_metadata?.role?.toString() ?? null);
  const isActive = profile?.is_active ?? true;
  if (!isActive) {
    const blocked = request.nextUrl.clone();
    blocked.pathname = "/account";
    blocked.searchParams.set("denied", "inactive");
    return NextResponse.redirect(blocked);
  }

  if (requiresAdmin) {
    if (!hasPermission(role, "admin:access")) {
      return NextResponse.redirect(getDeniedRedirect(request, getRoleDefaultPath(role)));
    }
    if (requiresSuperAdmin(pathname) && !hasPermission(role, "admin:staff_management")) {
      return NextResponse.redirect(getDeniedRedirect(request, "/admin"));
    }
  }

  if (requiresBeba && !hasPermission(role, "beba:access")) {
    return NextResponse.redirect(getDeniedRedirect(request, getRoleDefaultPath(role)));
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/beba/:path*",
  ],
};
