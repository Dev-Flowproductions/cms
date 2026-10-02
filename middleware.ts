import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

/** Framer plugin id from framer-plugin/framer.json — used for CORS allowlist */
const FRAMER_PLUGIN_ID = "wfc001";

/** Matches /en, /en/, /pt, /pt/, /fr, /fr/ */
function isLocaleRoot(pathname: string) {
  return /^\/(en|pt|fr)\/?$/.test(pathname);
}

/**
 * CORS for Framer plugin → CMS Content API (/api/v1).
 * Allows: local HTTPS plugin (mkcert) + Framer-hosted plugin origins.
 * See https://www.framer.com/developers/plugins-cors
 */
function getFramerPluginCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) return {};

  const localDev =
    /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const framerHosted = new RegExp(
    `^https://${FRAMER_PLUGIN_ID}(-[a-zA-Z0-9]+)?\\.plugins\\.framercdn\\.com$`,
    "i"
  ).test(origin);

  if (!localDev && !framerHosted) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Accept, x-api-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCorsHeaders(
  response: NextResponse,
  cors: Record<string, string>
): NextResponse {
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  return response;
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

  // ── API routes: session refresh (+ CORS for /api/v1 Framer plugin) ─────────
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/v1")) {
      const cors = getFramerPluginCorsHeaders(request);
      if (request.method === "OPTIONS") {
        return withCorsHeaders(new NextResponse(null, { status: 204 }), cors);
      }
      return withCorsHeaders(supabaseRes, cors);
    }
    return supabaseRes;
  }

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
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .eq("role_id", "admin")
      .maybeSingle();
    if (!adminRole) {
      const dest = new URL(`/${adminMatch[1]}/dashboard`, request.url);
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

    // Onboarding is enforced in dashboard layout (domain in DB), not here — avoids
    // false redirects when onboarding_done cookie is missing but setup is complete.
  }

  // ── Protect onboarding routes (must be authed) ──────────────────────────────
  const onboardingMatch = pathname.match(/^\/(en|pt|fr)\/onboarding(\/|$)/);
  if (onboardingMatch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const dest = new URL(`/${onboardingMatch[1]}/login`, request.url);
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
    "/api/:path*",
  ],
};
