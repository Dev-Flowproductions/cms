import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { getGoogleOAuthRedirectUri, getOAuthAppBaseUrl } from "@/lib/google/oauth-app-url";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export async function GET(request: Request) {
  const appBase = getOAuthAppBaseUrl();
  const redirectUri = getGoogleOAuthRedirectUri();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  let locale = "en";

  if (!appBase) {
    return new Response("NEXT_PUBLIC_APP_URL is not configured.", { status: 500 });
  }

  if (errorParam) {
    return NextResponse.redirect(`${appBase}/${locale}/onboarding/google?error=access_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appBase}/${locale}/onboarding/google?error=invalid_state`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appBase}/${locale}/onboarding/google?error=invalid_state`);
  }

  let userId: string;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = parsed.userId;
    locale = parsed.locale ?? "en";
  } catch {
    return NextResponse.redirect(`${appBase}/${locale}/onboarding/google?error=invalid_state`);
  }

  if (!redirectUri) {
    return new Response("OAuth redirect URI could not be built.", { status: 500 });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Google token exchange failed:", errText);
    return NextResponse.redirect(`${appBase}/${locale}/onboarding/google?error=token_exchange`);
  }

  const tokenData = await tokenRes.json();
  const { access_token, refresh_token, scope } = tokenData;

  const admin = createAdminClient();
  const { error: dbError } = await admin
    .from("clients")
    .update({
      google_access_token: access_token,
      google_refresh_token: refresh_token ?? null,
      google_scope: scope ?? null,
      google_connected_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (dbError) {
    console.error("Failed to store Google tokens:", dbError.message);
    return NextResponse.redirect(`${appBase}/${locale}/onboarding/google?error=db_error`);
  }

  cookieStore.delete("google_oauth_state");

  const response = NextResponse.redirect(`${appBase}/${locale}/dashboard`);
  response.cookies.set("onboarding_done", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
