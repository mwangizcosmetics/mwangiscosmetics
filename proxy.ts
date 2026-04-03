import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/supabase/database.types";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function isAdminUser(
  appMetadata: Record<string, unknown> | undefined,
  userMetadata: Record<string, unknown> | undefined,
) {
  return (
    appMetadata?.role === "admin" ||
    userMetadata?.role === "admin" ||
    userMetadata?.is_admin === true
  );
}

async function hasAdminProfile(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return profile?.role === "admin";
}

function getLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/login";
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.searchParams.set("next", nextPath);
  return redirectUrl;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresAuth =
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/checkout");
  const requiresAdmin = pathname.startsWith("/admin");

  if (!requiresAuth && !requiresAdmin) {
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

  if (!user && (requiresAuth || requiresAdmin)) {
    return NextResponse.redirect(getLoginRedirect(request));
  }

  if (
    requiresAdmin &&
    user &&
    !(
      isAdminUser(user.app_metadata, user.user_metadata) ||
      (await hasAdminProfile(supabase, user.id))
    )
  ) {
    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = "/account";
    deniedUrl.searchParams.set("denied", "admin");
    return NextResponse.redirect(deniedUrl);
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/orders/:path*", "/checkout/:path*", "/admin/:path*"],
};
