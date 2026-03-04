import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

/** Matches /en, /en/, /pt, /pt/, /fr, /fr/ (next-intl may use trailing slash) */
function isLocaleRoot(pathname: string): pathname is `/en` | `/pt` | `/fr` {
  return /^\/(en|pt|fr)\/?$/.test(pathname);
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase: refresh session and get response with updated cookies
  const { supabase, response: responseWithCookies } = await updateSession(request);

  // Redirect /admin and /admin/* to default locale
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const locale = routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Root "/" always goes to login first (first screen = login)
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}/login`, request.url));
  }

  // Admin: require auth in middleware so we never hit the layout without cookies (avoids redirect loop)
  const adminMatch = pathname.match(/^\/(en|pt|fr)\/admin(\/|$)/);
  if (adminMatch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const locale = adminMatch[1];
      const redirectRes = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      responseWithCookies.headers.getSetCookie().forEach((c) => redirectRes.headers.append("Set-Cookie", c));
      return redirectRes;
    }
  }

  // Dashboard: require auth (any logged-in user)
  const dashboardMatch = pathname.match(/^\/(en|pt|fr)\/dashboard(\/|$)/);
  if (dashboardMatch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const locale = dashboardMatch[1];
      const redirectRes = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      responseWithCookies.headers.getSetCookie().forEach((c) => redirectRes.headers.append("Set-Cookie", c));
      return redirectRes;
    }
  }

  // First screen = login: redirect from locale root based on auth state
  if (isLocaleRoot(pathname)) {
    const { data: { user } } = await supabase.auth.getUser();
    const locale = pathname.replace(/^\/|\/$/g, "") || routing.defaultLocale;
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    // Authenticated: send to dashboard
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Return response with refreshed cookies so client stays in sync (Supabase recommendation)
  const intlResponse = intlMiddleware(request);
  const isRedirect = intlResponse.status === 307 || intlResponse.status === 302;
  if (isRedirect) {
    return intlResponse;
  }
  return responseWithCookies;
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/(en|pt|fr)/:path*",
  ],
};
