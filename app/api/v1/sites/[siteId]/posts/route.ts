import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSiteApiKey, getApiKeyFromRequest } from "@/lib/cms-api/auth";
import { getPublishedPosts } from "@/lib/cms-api/data";
import type { ApiPostsResponse } from "@/lib/cms-api/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const apiKey = getApiKeyFromRequest(request);
  const site = await validateSiteApiKey(siteId, apiKey);

  if (!site) {
    return NextResponse.json(
      { error: "Invalid or missing API key for this site" },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const status = searchParams.get("status");
  if (status && status !== "published") {
    return NextResponse.json(
      { error: "Only status=published is supported" },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const { posts, total } = await getPublishedPosts(admin, site.userId, {
      page,
      limit,
      sort: "newest",
    });

    const totalPages = Math.ceil(total / limit);
    const response: ApiPostsResponse = {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[cms-api] GET posts error:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
