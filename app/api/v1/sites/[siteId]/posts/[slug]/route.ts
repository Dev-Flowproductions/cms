import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSiteApiKey, getApiKeyFromRequest } from "@/lib/cms-api/auth";
import { getPublishedPostBySlug } from "@/lib/cms-api/data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; slug: string }> }
) {
  const { siteId, slug } = await params;
  const apiKey = getApiKeyFromRequest(_request);
  const site = await validateSiteApiKey(siteId, apiKey);

  if (!site) {
    return NextResponse.json(
      { error: "Invalid or missing API key for this site" },
      { status: 401 }
    );
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const post = await getPublishedPostBySlug(admin, site.userId, slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[cms-api] GET post by slug error:", err);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
