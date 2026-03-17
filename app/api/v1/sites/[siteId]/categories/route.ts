import { NextRequest, NextResponse } from "next/server";
import { validateSiteApiKey, getApiKeyFromRequest } from "@/lib/cms-api/auth";
import type { ApiCategory } from "@/lib/cms-api/types";

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

  // Phase 1: no categories in CMS yet; return empty array
  const categories: ApiCategory[] = [];

  return NextResponse.json(categories, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
