import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

/** Matches /en, /en/, /pt, /pt/, /fr, /fr/ */
function isLocaleRoot(pathname: string) {
  return /^\/(en|pt|fr)\/?$/.test(pathname);
}

/**
 * Copy Set-Cookie headers from `src` into `dest` so Supabase session
 * cookies are always forwarded regardless of which response we return.
 */
function copySupabaseCookies(src: NextResponse, dest: NextResponse): NextResponse {
  src.headers.getSetCookie().forEach((c) => dest.headers.append("Set-Cookie", c));
  return dest;
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Refresh Supabase session — must happen first so cookies are up to date
  const { supabase, response: supabaseRes } = await updateSession(request);

  // ── Hard redirects (no intl needed) ────────────────────────────────────────

  // Redirect bare /admin/* to default locale
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}${pathname}`;
    return copySupabaseCookies(supabaseRes, NextResponse.redirect(url));
  }

  // Root "/" → login
  if (pathname === "/") {
    const dest = new URL(`/${routing.defaultLocale}/login`, request.url);
    return copySupabaseCookies(supabaseRes, NextResponse.redirect(dest));
  }

  // ── Auth-gated routes ───────────────────────────────────────────────────────

  const adminMatch = pathname.match(/^\/(en|pt|fr)\/admin(\/|$)/);
  if (adminMatch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const dest = new URL(`/${adminMatch[1]}/login`, request.url);
      return copySupabaseCookies(supabaseRes, NextResponse.redirect(dest));
    }
  }

  const dashboardMatch = pathname.match(/^\/(en|pt|fr)\/dashboard(\/|$)/);
  if (dashboardMatch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const dest = new URL(`/${dashboardMatch[1]}/login`, request.url);
      return copySupabaseCookies(supabaseRes, NextResponse.redirect(dest));
    }
  }

  // Locale root → login (unauthed) or dashboard (authed)
  if (isLocaleRoot(pathname)) {
    const { data: { user } } = await supabase.auth.getUser();
    const locale = pathname.replace(/^\/|\/$/g, "") || routing.defaultLocale;
    const dest = user
      ? new URL(`/${locale}/dashboard`, request.url)
      : new URL(`/${locale}/login`, request.url);
    return copySupabaseCookies(supabaseRes, NextResponse.redirect(dest));
  }

  // ── Normal page request: run intlMiddleware so locale cookie is always set ──
  // intlMiddleware may itself redirect (e.g. unknown locale → default).
  // In all cases we merge Supabase cookies into its response.
  const intlRes = intlMiddleware(request);
  return copySupabaseCookies(supabaseRes, intlRes);
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/(en|pt|fr)/:path*",
  ],
};
