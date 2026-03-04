import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/redirect-to-dashboard?locale=en
 * After client-side sign-in we navigate here so the server receives cookies.
 * We return 200 with HTML that redirects client-side so the next request (to /admin) sends cookies.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en";
  const segment = ["en", "pt", "fr"].includes(locale) ? locale : "en";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/${segment}/login`, request.url));
  }

  // Client-side redirect: use absolute URL so the browser sends cookies on the next request
  const origin = new URL(request.url).origin;
  const destination = `${origin}/${segment}/admin`;
  const escaped = destination.replace(/"/g, '\\"');
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${destination}"></head><body><p>Redirecting…</p><script>window.location.replace("${escaped}");</script></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
