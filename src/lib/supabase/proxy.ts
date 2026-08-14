import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/services/redirects";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const AUTH_ROUTES = new Set(["/login", "/cadastro"]);

function copySessionState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const headerName of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(headerName);
    if (value) target.headers.set(headerName, value);
  }

  return target;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, responseHeaders) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );

        Object.entries(responseHeaders).forEach(([name, value]) =>
          supabaseResponse.headers.set(name, value),
        );
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;

  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      getSafeRedirectPath(`${pathname}${request.nextUrl.search}`),
    );

    return copySessionState(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  if (isAuthenticated && AUTH_ROUTES.has(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";

    return copySessionState(
      supabaseResponse,
      NextResponse.redirect(dashboardUrl),
    );
  }

  return supabaseResponse;
}
