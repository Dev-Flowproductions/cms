import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSiteApiKey, getApiKeyFromRequest } from "@/lib/cms-api/auth";
import { getSitemapEntries } from "@/lib/cms-api/data";
import type { ApiSitemapResponse } from "@/lib/cms-api/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const apiKey = getApiKeyFromRequest(_request);
  const site = await validateSiteApiKey(siteId, apiKey);

  if (!site) {
    return NextResponse.json(
      { error: "Invalid or missing API key for this site" },
      { status: 401 }
    );
  }

  try {
    const admin = createAdminClient();
    const urls = await getSitemapEntries(admin, site.userId);

    const response: ApiSitemapResponse = { urls };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[cms-api] GET sitemap error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sitemap" },
      { status: 500 }
    );
  }
}
