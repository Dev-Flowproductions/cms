import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSiteApiKey, getApiKeyFromRequest } from "@/lib/cms-api/auth";
import { getAuthors } from "@/lib/cms-api/data";

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
    const authors = await getAuthors(admin, site.userId);

    return NextResponse.json(authors, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[cms-api] GET authors error:", err);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
